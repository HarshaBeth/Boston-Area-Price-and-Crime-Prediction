"""Custom regression model with manual gradient descent.

This class is intentionally lightweight so it can be imported, trained on any
processed dataset, and serialized via pickle/joblib/JSON/NPZ/PyTorch/ONNX.
It implements:
- parameter initialization (zeros)
- mean squared error cost function
- analytical gradients
- parameter update rule (gradient descent)
- training loop with per-iteration loss logs
"""
from __future__ import annotations

from itertools import combinations_with_replacement
from pathlib import Path
from typing import Any, ClassVar, Dict, List, Optional, Sequence, Tuple, Union

import json
import importlib
import numpy as np
import pickle


class PriceRegressionModel:
    """Simple regression trained via batch gradient descent."""

    SUPPORTED_SAVE_FORMATS: ClassVar[Tuple[str, ...]] = (
        "pkl",
        "pickle",
        "joblib",
        "json",
        "npz",
        "npy",
        "pth",
        "onnx",
    )

    def __init__(self) -> None:
        self.weights_: Optional[np.ndarray] = None
        self.bias_: float = 0.0
        self.history: List[float] = []
        self.is_fitted_: bool = False
        self._feature_map_: Optional[List[Tuple[int, ...]]] = None
        self._n_raw_features_: Optional[int] = None
        self._degree: Optional[int] = None
        self._cost_function: Optional[str] = None
        self._training_params: Dict[str, Any] = {}

    def _to_numpy_features(self, X: Sequence[Sequence[float]]) -> np.ndarray:
        if hasattr(X, "to_numpy"):
            X_array = np.asarray(X.to_numpy(), dtype=np.float64)
        else:
            X_array = np.asarray(X, dtype=np.float64)
        return X_array

    def _to_numpy_target(self, y: Sequence[float]) -> np.ndarray:
        if hasattr(y, "to_numpy"):
            y_array = np.asarray(y.to_numpy(), dtype=np.float64)
        else:
            y_array = np.asarray(y, dtype=np.float64)
        return y_array.reshape(-1)

    def _prepare_data(
        self, X: Sequence[Sequence[float]], y: Sequence[float]
    ) -> Tuple[np.ndarray, np.ndarray]:
        X_array = self._to_numpy_features(X)
        y_array = self._to_numpy_target(y)
        if X_array.ndim != 2:
            raise ValueError("X must be 2-dimensional (n_samples, n_features)")
        if y_array.shape[0] != X_array.shape[0]:
            raise ValueError("X and y must contain the same number of samples")
        if X_array.shape[0] == 0:
            raise ValueError(
                "Received empty dataset; provide at least one sample"
            )
        return X_array, y_array

    def _ensure_is_fitted(self) -> None:
        if not self.is_fitted_ or self.weights_ is None:
            raise RuntimeError("Fit the model before saving or predicting.")
        if self._degree is None or self._cost_function is None:
            raise RuntimeError("Model configuration missing; refit the model.")

    def _feature_map_as_lists(self) -> Optional[List[List[int]]]:
        if self._feature_map_ is None:
            return None
        return [list(combo) for combo in self._feature_map_]

    def _export_state_dict(self) -> Dict[str, Any]:
        self._ensure_is_fitted()
        training_params = self._training_params
        return {
            "learning_rate": training_params.get("learning_rate"),
            "num_iterations": training_params.get("num_iterations"),
            "log_every": training_params.get("log_every"),
            "degree": self._degree,
            "cost_function": self._cost_function,
            "initial_weights": training_params.get("initial_weights"),
            "initial_bias": training_params.get("initial_bias"),
            "weights": self.weights_.astype(float).tolist()
            if self.weights_ is not None
            else None,
            "bias": float(self.bias_),
            "feature_map": self._feature_map_as_lists(),
            "n_raw_features": self._n_raw_features_,
            "history": list(self.history),
        }

    def _export_numpy_payload(self) -> Dict[str, np.ndarray]:
        self._ensure_is_fitted()
        feature_map_lists = self._feature_map_as_lists()
        feature_map_array = (
            np.array(feature_map_lists, dtype=object)
            if feature_map_lists is not None
            else np.array([], dtype=object)
        )
        return {
            "weights": self.weights_.astype(np.float64)
            if self.weights_ is not None
            else np.array([], dtype=np.float64),
            "bias": np.array([self.bias_], dtype=np.float64),
            "degree": np.array([self._degree], dtype=np.int64),
            "n_raw_features": np.array(
                [self._n_raw_features_ or 0], dtype=np.int64
            ),
            "feature_map": feature_map_array,
        }

    def _build_feature_map(self, n_features: int) -> None:
        if self._degree is None or self._degree < 1:
            raise ValueError("degree must be >= 1")
        feature_map: List[Tuple[int, ...]] = []
        for deg in range(1, self._degree + 1):
            feature_map.extend(
                combinations_with_replacement(range(n_features), deg)
            )
        self._feature_map_ = feature_map
        self._n_raw_features_ = n_features

    def _expand_features(self, X: np.ndarray) -> np.ndarray:
        if self._feature_map_ is None:
            # degree == 1 and fit not called yet; treat as identity
            return X
        if self._degree == 1:
            return X
        cols = [np.prod(X[:, combo], axis=1) for combo in self._feature_map_]
        return np.column_stack(cols)

    def _initialize_parameters(
        self,
        n_features: int,
        initial_weights: Optional[Sequence[float]],
        initial_bias: Optional[float],
    ) -> None:
        if initial_weights is not None:
            weights = np.asarray(initial_weights, dtype=np.float64).reshape(-1)
            if weights.shape[0] != n_features:
                raise ValueError(
                    "initial_weights length must match expanded feature count"
                )
            self.weights_ = weights.copy()
        else:
            self.weights_ = np.zeros(n_features, dtype=np.float64)

        self.bias_ = float(initial_bias) if initial_bias is not None else 0.0

    def _predict_raw(self, X: np.ndarray) -> np.ndarray:
        if self.weights_ is None:
            raise RuntimeError("Model parameters have not been initialized")
        return X @ self.weights_ + self.bias_

    def _compute_loss(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        if self._cost_function != "mse":
            raise ValueError("Only 'mse' cost_function is currently supported")
        residuals = y_pred - y_true
        return float(np.mean(residuals ** 2) / 2.0)

    def _compute_gradients(
        self, X: np.ndarray, y_true: np.ndarray, y_pred: np.ndarray
    ) -> Tuple[np.ndarray, float]:
        n_samples = X.shape[0]
        residuals = y_pred - y_true
        grad_w = (X.T @ residuals) / n_samples
        grad_b = float(np.sum(residuals) / n_samples)
        return grad_w, grad_b

    def _update_parameters(
        self, grad_w: np.ndarray, grad_b: float, learning_rate: float
    ) -> None:
        if self.weights_ is None:
            raise RuntimeError("Model parameters have not been initialized")
        self.weights_ -= learning_rate * grad_w
        self.bias_ -= learning_rate * grad_b

    @staticmethod
    def _validate_hyperparameters(
        learning_rate: float,
        num_iterations: int,
        log_every: int,
        degree: int,
        cost_function: str,
    ) -> str:
        if learning_rate <= 0:
            raise ValueError("learning_rate must be positive")
        if num_iterations < 1:
            raise ValueError("num_iterations must be at least 1")
        if log_every < 1:
            raise ValueError("log_every must be at least 1")
        if degree < 1:
            raise ValueError("degree must be at least 1")
        normalized_cost = cost_function.lower()
        if normalized_cost != "mse":
            raise ValueError("Only 'mse' cost_function is currently supported")
        return normalized_cost

    def fit(
        self,
        X: Sequence[Sequence[float]],
        y: Sequence[float],
        *,
        degree: int = 1,
        learning_rate: float = 0.01,
        num_iterations: int = 1_000,
        log_every: int = 1,
        cost_function: str = "mse",
        initial_weights: Optional[Sequence[float]] = None,
        initial_bias: Optional[float] = None,
    ) -> "PriceRegressionModel":
        normalized_cost = self._validate_hyperparameters(
            learning_rate,
            num_iterations,
            log_every,
            degree,
            cost_function,
        )

        stored_initial_weights = None
        if initial_weights is not None:
            stored_initial_weights = np.asarray(
                initial_weights, dtype=np.float64
            ).reshape(-1).tolist()

        self._degree = degree
        self._cost_function = normalized_cost
        self._training_params = {
            "learning_rate": learning_rate,
            "num_iterations": num_iterations,
            "log_every": log_every,
            "cost_function": normalized_cost,
            "initial_weights": stored_initial_weights,
            "initial_bias": initial_bias,
        }

        X_array, y_array = self._prepare_data(X, y)
        _, n_raw_features = X_array.shape
        self._build_feature_map(n_raw_features)
        design_matrix = (
            X_array if degree == 1 else self._expand_features(X_array)
        )
        n_features = design_matrix.shape[1]
        self._initialize_parameters(
            n_features, initial_weights, initial_bias
        )
        self.history = []

        for iteration in range(1, num_iterations + 1):
            predictions = self._predict_raw(design_matrix)
            loss = self._compute_loss(y_array, predictions)
            grad_w, grad_b = self._compute_gradients(
                design_matrix, y_array, predictions
            )
            self._update_parameters(grad_w, grad_b, learning_rate)

            if iteration % log_every == 0:
                self.history.append(loss)

        self.is_fitted_ = True
        return self

    def predict(self, X: Sequence[Sequence[float]]) -> np.ndarray:
        if not self.is_fitted_:
            raise RuntimeError("Call fit before predict.")
        X_array = self._to_numpy_features(X)
        if self._n_raw_features_ is None:
            raise RuntimeError(
                "Model missing feature metadata; refit the model."
            )
        if self._degree is None:
            raise RuntimeError(
                "Model missing degree metadata; refit the model."
            )
        if X_array.shape[1] != self._n_raw_features_:
            raise ValueError(
                "Input feature dimension mismatch. Expected "
                f"{self._n_raw_features_}, got {X_array.shape[1]}"
            )
        design_matrix = (
            X_array if self._degree == 1 else self._expand_features(X_array)
        )
        return self._predict_raw(design_matrix)

    def _save_with_pickle(self, path: Path) -> None:
        with path.open("wb") as file_obj:
            pickle.dump(self, file_obj)

    def _save_with_joblib(self, path: Path) -> None:
        try:
            joblib = importlib.import_module("joblib")
        except ImportError as exc:  # pragma: no cover - optional dependency
            raise ImportError(
                "joblib is required to save in .joblib format"
            ) from exc
        joblib.dump(self, path)

    def _save_as_json(self, path: Path) -> None:
        state = self._export_state_dict()
        with path.open("w", encoding="utf-8") as file_obj:
            json.dump(state, file_obj, indent=2)

    def _save_as_npz(self, path: Path) -> None:
        payload = self._export_numpy_payload()
        np.savez_compressed(path, **payload)

    def _save_as_npy(self, path: Path) -> None:
        payload = self._export_numpy_payload()
        np.save(path, payload, allow_pickle=True)

    def _save_as_pth(self, path: Path) -> None:
        try:
            torch = importlib.import_module("torch")
        except ImportError as exc:  # pragma: no cover - optional dependency
            raise ImportError(
                "PyTorch is required to save in .pth format"
            ) from exc
        self._ensure_is_fitted()
        torch_state = {
            "weights": torch.from_numpy(
                self.weights_.astype(np.float32)
            ),
            "bias": torch.tensor([self.bias_], dtype=torch.float32),
            "degree": torch.tensor(self._degree, dtype=torch.int64),
            "n_raw_features": torch.tensor(
                self._n_raw_features_ or 0, dtype=torch.int64
            ),
            "feature_map": self._feature_map_as_lists(),
            "metadata": {
                "learning_rate": self._training_params.get("learning_rate"),
                "num_iterations": self._training_params.get("num_iterations"),
                "log_every": self._training_params.get("log_every"),
                "cost_function": self._cost_function,
            },
        }
        torch.save(torch_state, path)

    def _save_as_onnx(self, path: Path) -> None:
        try:
            onnx = importlib.import_module("onnx")
        except ImportError as exc:  # pragma: no cover - optional dependency
            raise ImportError(
                "onnx is required to save in .onnx format"
            ) from exc
        helper = onnx.helper
        TensorProto = onnx.TensorProto
        self._ensure_is_fitted()
        if self.weights_ is None:
            raise RuntimeError("Model parameters have not been initialized")

        n_features = int(self.weights_.shape[0])
        weights_matrix = self.weights_.astype(np.float32).reshape(-1, 1)
        bias_vector = np.array([self.bias_], dtype=np.float32)

        input_tensor = helper.make_tensor_value_info(
            "input", TensorProto.FLOAT, [None, n_features]
        )
        output_tensor = helper.make_tensor_value_info(
            "output", TensorProto.FLOAT, [None, 1]
        )

        weight_initializer = helper.make_tensor(
            name="weights_const",
            data_type=TensorProto.FLOAT,
            dims=weights_matrix.shape,
            vals=weights_matrix.flatten().tolist(),
        )
        bias_initializer = helper.make_tensor(
            name="bias_const",
            data_type=TensorProto.FLOAT,
            dims=[1],
            vals=bias_vector.tolist(),
        )

        matmul_node = helper.make_node(
            "MatMul", ["input", "weights_const"], ["matmul_out"]
        )
        add_node = helper.make_node(
            "Add", ["matmul_out", "bias_const"], ["output"]
        )

        graph = helper.make_graph(
            nodes=[matmul_node, add_node],
            name="PriceRegressionModel",
            inputs=[input_tensor],
            outputs=[output_tensor],
            initializer=[weight_initializer, bias_initializer],
        )
        model = helper.make_model(graph)
        onnx.checker.check_model(model)
        onnx.save(model, path)

    def save(
        self, output_path: Union[str, Path], fmt: Optional[str] = None
    ) -> Path:
        self._ensure_is_fitted()

        path = Path(output_path)
        resolved_fmt = (
            fmt.lower()
            if fmt
            else path.suffix.lstrip(".").lower() or "pkl"
        )
        if resolved_fmt not in self.SUPPORTED_SAVE_FORMATS:
            supported_display = ", ".join(
                f".{ext}" for ext in self.SUPPORTED_SAVE_FORMATS
            )
            raise ValueError(
                f"Unsupported format. Choose one of: {supported_display}"
            )

        path = path.with_suffix(f".{resolved_fmt}")
        handler_map = {
            "pkl": self._save_with_pickle,
            "pickle": self._save_with_pickle,
            "joblib": self._save_with_joblib,
            "json": self._save_as_json,
            "npz": self._save_as_npz,
            "npy": self._save_as_npy,
            "pth": self._save_as_pth,
            "onnx": self._save_as_onnx,
        }
        handler = handler_map[resolved_fmt]
        handler(path)
        return path

    def get_training_history(self) -> List[float]:
        return list(self.history)
