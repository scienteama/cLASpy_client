/* eslint-disable @typescript-eslint/no-explicit-any */
import { h } from 'vue';
import { intRule, minRule, requiredRule } from '../validation/rules';

/**
 * Analyse une chaîne `typeinfo` pour extraire les informations sur le type.
 *
 * Exemples de `typeinfo` :
 * - "int non-negative"
 * - "float"
 * - "bool"
 * - "enum{'A', 'B', 'C'}"
 *
 * @param typeinfo Chaîne décrivant le type
 * @param defaultValue Valeur par défaut (ex: "None")
 * @param name Nom du champ
 * @returns Objet contenant les informations extraites sur le type
 */
export function parseTypeInfo(typeinfo: string, defaultValue: string, name: string) {
  const info = typeinfo.toLowerCase();
  return {
    name: name,
    isBool: info.includes('bool'),
    isInt: info.includes('int'),
    isFloat: info.includes('float'),
    isNumeric: info.includes('int') || info.includes('float'),
    isNonNegative: info.includes('non-negative'),
    isArray: info.includes('array') || info.includes('list'),
    allowsNone: defaultValue === 'None',
    hasEnum: /\{.*\}/.test(info),
    enumValues: extractEnumValues(typeinfo),
  };
}

/**
 * Extrait les valeurs d’un énuméré depuis une chaîne typeinfo.
 *
 * @param typeinfo Chaîne contenant {val1, val2, val3}
 * @returns Tableau de valeurs ou null si aucune
 */
function extractEnumValues(typeinfo: string): string[] | null {
  const match = typeinfo.match(/\{([^}]+)\}/);
  if (!match) return null;

  return match[1]!.split(',').map((v) => v.replace(/['"]/g, '').trim());
}

/**
 * Génère les props à passer à un composant Quasar (`QInput`, `QCheckbox`, `QSelect`)
 * en fonction du type du champ et de ses contraintes.
 *
 * @param row Objet contenant au moins `typeinfo` et `default`
 * @param name Nom du champ
 * @returns Props à injecter dans le composant Quasar
 */
export function getInputProps(row: any, name: string) {
  const props: Record<string, any> = {};
  const t = parseTypeInfo(row.typeinfo, row.default, name);
  props.hideBottomSpace = true;
  props.noErrorIcon = true;
  props.rules = [];

  if (!t.allowsNone) {
    props.rules.push(requiredRule(name, false));
  }

  /* =======================
     QCheckbox
  ======================= */
  if (t.isBool) {
    props.trueValue = true;
    props.falseValue = false;
    props.dense = true;
    return props;
  }

  /* =======================
     QSelect (enum)
  ======================= */
  if (t.hasEnum && t.enumValues?.length) {
    props.options = [...t.enumValues];
    props.useInput = true;
    props.newValueMode = 'add';
    props.emitValue = true;
    props.mapOptions = false;
    props.dense = true;
    props.clearable = t.allowsNone;
    props.hideDropdownIcon = false;
    props.inputDebounce = 0;
    props.borderless = true;

    // Slot pour styliser la valeur sélectionnée
    props.selectedItemSlot = (scope: any) => {
      return h(
        'span',
        {
          style: {
            color: '#9c27b0',
            fontWeight: 'bold',
          },
        },
        scope.opt
      );
    };

    return props;
  }

  /* =======================
     QInput numérique
  ======================= */
  if (t.isNumeric) {
    props.type = 'number';
    props.step = t.isInt ? 1 : 'any';
    if (t.isNonNegative) props.min = 0;

    if (t.isNonNegative) {
      props.min = 0;
      props.rules.push(minRule(0, false));
    }

    if (t.isInt) {
      props.rules.push(intRule(false));
    }
  }

  /* =======================
     QInput array / autre
  ======================= */
  if (t.isArray) {
    props.type = 'text';
    props.placeholder = '[1, 2, 3]';
  }

  /* =======================
     Commun
  ======================= */
  props.dense = true;
  props.borderless = true;
  props.clearable = t.allowsNone;
  props.inputClass = 'text-bold text-accent';

  return props;
}

/**
 * Liste des métriques/scorers disponibles pour les modèles.
 */
export const scorerList = [
  'accuracy',
  'balanced_accuracy',
  'top_k_accuracy',
  'average_precision',
  'neg_brier_score',
  'f1_micro',
  'f1_macro',
  'f1_weighted',
  'precision_micro',
  'precision_macro',
  'precision_weighted',
  'recall_micro',
  'recall_macro',
  'recall_weighted',
  'roc_auc',
  'roc_auc_ovr',
  'roc_auc_ovo',
  'roc_ovr_weighted',
  'roc_ovo_weighted',
];
