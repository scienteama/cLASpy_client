/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-explicit-any */

type Parameter<T = any> = {
  value: T;
  typeinfo: string;
  choices: readonly T[] | null;
  default: string;
};

export type SklearnAlgorithmName = keyof SklearnAlgorithmParams;

// ---------------- AdaBoost ----------------
type AdaBoostParams = {
  description: string;
  parameters: {
    algorithm: Parameter<'SAMME' | 'SAMME.R'>;
    estimator: Parameter<any | null>;
    learning_rate: Parameter<number>;
    n_estimators: Parameter<number>;
    random_state: Parameter<number | null>;
  };
};

// ---------------- Gradient Boosting ----------------
type GradientBoostingParams = {
  description: string;
  parameters: {
    ccp_alpha: Parameter<number>;
    criterion: Parameter<'friedman_mse' | 'squared_error'>;
    init: Parameter<any | null>;
    learning_rate: Parameter<number>;
    loss: Parameter<'log_loss' | 'exponential'>;
    max_depth: Parameter<number | null>;
    max_features: Parameter<'sqrt' | 'log2' | number | null>;
    max_leaf_nodes: Parameter<number | null>;
    min_impurity_decrease: Parameter<number>;
    min_samples_leaf: Parameter<number>;
    min_samples_split: Parameter<number>;
    min_weight_fraction_leaf: Parameter<number>;
    n_estimators: Parameter<number>;
    n_iter_no_change: Parameter<number | null>;
    random_state: Parameter<number | null>;
    subsample: Parameter<number>;
    tol: Parameter<number>;
    validation_fraction: Parameter<number>;
    verbose: Parameter<number>;
    warm_start: Parameter<boolean>;
  };
};

// ---------------- HistGradientBoosting ----------------
type HistGradientBoostingParams = {
  description: string;
  parameters: {
    max_iter: Parameter<number>;
    max_leaf_nodes: Parameter<number | null>;
    learning_rate: Parameter<number>;
    loss: Parameter<'log_loss' | 'squared_error' | 'auto'>;
    min_samples_leaf: Parameter<number>;
    max_depth: Parameter<number | null>;
    random_state: Parameter<number | null>;
    validation_fraction: Parameter<number>;
    early_stopping: Parameter<boolean>;
    warm_start: Parameter<boolean>;
  };
};

// ---------------- Random Forest ----------------
type RandomForestParams = {
  description: string;
  parameters: {
    n_estimators: Parameter<number>;
    criterion: Parameter<'gini' | 'entropy' | 'squared_error'>;
    max_depth: Parameter<number | null>;
    min_samples_split: Parameter<number>;
    min_samples_leaf: Parameter<number>;
    min_weight_fraction_leaf: Parameter<number>;
    max_features: Parameter<'sqrt' | 'log2' | number | null>;
    max_leaf_nodes: Parameter<number | null>;
    min_impurity_decrease: Parameter<number>;
    bootstrap: Parameter<boolean>;
    oob_score: Parameter<boolean>;
    n_jobs: Parameter<number | null>;
    random_state: Parameter<number | null>;
    verbose: Parameter<number>;
    warm_start: Parameter<boolean>;
  };
};

// ---------------- Extra Trees ----------------
type ExtraTreesParams = RandomForestParams;

// ---------------- Bagging ----------------
type BaggingParams = {
  description: string;
  parameters: {
    base_estimator: Parameter<any | null>;
    n_estimators: Parameter<number>;
    max_samples: Parameter<number | null>;
    max_features: Parameter<number | null>;
    bootstrap: Parameter<boolean>;
    bootstrap_features: Parameter<boolean>;
    oob_score: Parameter<boolean>;
    warm_start: Parameter<boolean>;
    n_jobs: Parameter<number | null>;
    random_state: Parameter<number | null>;
    verbose: Parameter<number>;
  };
};

// ---------------- IsolationForest ----------------
type IsolationForestParams = {
  description: string;
  parameters: {
    n_estimators: Parameter<number>;
    max_samples: Parameter<number | 'auto'>;
    contamination: Parameter<number | 'auto'>;
    max_features: Parameter<number>;
    bootstrap: Parameter<boolean>;
    n_jobs: Parameter<number | null>;
    random_state: Parameter<number | null>;
    verbose: Parameter<number>;
    warm_start: Parameter<boolean>;
  };
};

// ---------------- Stacking ----------------
type StackingParams = {
  description: string;
  parameters: {
    estimators: Parameter<any[]>;
    final_estimator: Parameter<any>;
    cv: Parameter<number | 'prefit'>;
    n_jobs: Parameter<number | null>;
    passthrough: Parameter<boolean>;
    verbose: Parameter<number>;
  };
};

// ---------------- Voting ----------------
type VotingParams = {
  description: string;
  parameters: {
    estimators: Parameter<any[]>;
    voting: Parameter<'hard' | 'soft'>;
    weights: Parameter<number[] | null>;
    n_jobs: Parameter<number | null>;
    flatten_transform: Parameter<boolean>;
    verbose: Parameter<number>;
  };
};

// ---------------- MLP ----------------
type MLPParams = {
  description: string;
  parameters: {
    activation: Parameter<'identity' | 'logistic' | 'tanh' | 'relu'>;
    alpha: Parameter<number>;
    batch_size: Parameter<number | 'auto'>;
    beta_1: Parameter<number>;
    beta_2: Parameter<number>;
    early_stopping: Parameter<boolean>;
    epsilon: Parameter<number>;
    hidden_layer_sizes: Parameter<number[]>;
    learning_rate: Parameter<'constant' | 'invscaling' | 'adaptive'>;
    learning_rate_init: Parameter<number>;
    max_fun: Parameter<number>;
    max_iter: Parameter<number>;
    momentum: Parameter<number>;
    n_iter_no_change: Parameter<number>;
    nesterovs_momentum: Parameter<boolean>;
    power_t: Parameter<number>;
    random_state: Parameter<number | null>;
    shuffle: Parameter<boolean>;
    solver: Parameter<'lbfgs' | 'sgd' | 'adam'>;
    tol: Parameter<number>;
    validation_fraction: Parameter<number>;
    verbose: Parameter<boolean>;
    warm_start: Parameter<boolean>;
  };
};

// ---------------- Aliases Regressors ----------------
type AdaBoostRegressorParams = AdaBoostParams;
type GradientBoostingRegressorParams = GradientBoostingParams;
type HistGradientBoostingRegressorParams = HistGradientBoostingParams;
type RandomForestRegressorParams = RandomForestParams;
type ExtraTreesRegressorParams = ExtraTreesParams;
type BaggingRegressorParams = BaggingParams;
type VotingRegressorParams = VotingParams;
type StackingRegressorParams = StackingParams;
type MLPRegressorParams = MLPParams;

// ---------------- SklearnAlgorithmParams ----------------
export type SklearnAlgorithmParams = {
  AdaBoostClassifier: AdaBoostParams;
  AdaBoostRegressor: AdaBoostRegressorParams;
  GradientBoostingClassifier: GradientBoostingParams;
  GradientBoostingRegressor: GradientBoostingRegressorParams;
  HistGradientBoostingClassifier: HistGradientBoostingParams;
  HistGradientBoostingRegressor: HistGradientBoostingRegressorParams;
  RandomForestClassifier: RandomForestParams;
  RandomForestRegressor: RandomForestRegressorParams;
  ExtraTreesClassifier: ExtraTreesParams;
  ExtraTreesRegressor: ExtraTreesRegressorParams;
  BaggingClassifier: BaggingParams;
  BaggingRegressor: BaggingRegressorParams;
  IsolationForest: IsolationForestParams;
  StackingClassifier: StackingParams;
  StackingRegressor: StackingRegressorParams;
  VotingClassifier: VotingParams;
  VotingRegressor: VotingRegressorParams;
  MLPClassifier: MLPParams;
  MLPRegressor: MLPRegressorParams;
};

export type AlgoParamValue = boolean | number | string | Record<string, unknown> | unknown[] | null;
export type AlgoParameters = Record<string, AlgoParamValue>;

export interface AlgoParameter {
  value: AlgoParamValue;
}
