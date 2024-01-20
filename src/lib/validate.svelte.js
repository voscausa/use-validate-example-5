import { getValidators, validDay } from "./validators";
export { validDay };

const isObj = obj => typeof obj === "object" && !Array.isArray(obj);

// Validator for use: field={obj} and adds function OK() and values 
export function validate(config, callback = null) { // callback depricated

  // mark 0: no-border and no-text, 1: red-border 2: text 3: red-border and text
  const { rulesConfig, nodeKey = "name", lazy = true, markDefault = 3, alertBelow = 0 } = config;

  let runRuleChain = {}; // runRuleChain {[id]: closure} to rerun validation or update chain
  // eslint-disable-next-line no-undef
  let fieldValues = $state({});  // validated form values: {[id]: value}
  let nodeContext = {}; // used to clear errors: reset setNotValid


  const alertNodes = {};  // alert msg nodes

  const [validators, setNotValid] = getValidators(alertBelow, alertNodes);

  return {
    fieldValues,  // validated field values 
    runRuleChain, // run ruleChain closures
    setNotValid,  // setNotValid if we need it to add a addValidator with: return setNotValid()

    field(node, obj) {
      // value = object (and not an array object) or value or values array
      // examples: {value: value, mark: false, controls: [control values] } or value
      // optional control values to control the validator behaviour
      let { value, id = node[nodeKey], mark = markDefault, controls = [] } =
        isObj(obj) ? obj : { value: obj };

      if (!id) console.log(`validate nodekey ${nodeKey} missing in node`, node, obj);
      let ruleChain = rulesConfig[id]; // enclose ruleChain

      // inner closure to validate node value: apply rule chain (array / chain of rules)
      runRuleChain[id] = (altRuleChain = null) => {
        if (altRuleChain !== null) ruleChain = altRuleChain;

        let notValid = false;
        // run the rulechain array: {validator: { options}} or chain: [validator obj, ..] or "validator"
        for (const rule of Array.isArray(ruleChain) ? ruleChain : [ruleChain]) {
          const [validator, options] = (typeof rule === "object") ? Object.entries(rule)[0] : [rule, {}];

          // validator ctx (this context): {id, node, mark, value, [rest]}
          const ctx = { id, node, mark, value };
          // we allow an array of controls
          ctx.controls = Array.isArray(controls) ? controls : [controls];
          nodeContext[id] = ctx;

          notValid = validators[validator].call(ctx, options);
          // break the chain if notValid was returned
          if (notValid) break;
          value = ctx.value;
        }

        // ruleChain finished, set field results
        if (value !== fieldValues[id]) {
          fieldValues[id] = value;
          // callback to pass node validation result
          if (callback) callback(id, notValid, value);
        }
        return notValid;
      };

      if (!lazy) runRuleChain[id]();

      return {
        // value update and optional controls update
        update(obj) {
          // value = object (and not an array object) or a value
          ({ value, controls =[] } = isObj(obj) ? obj : { value: obj });
          runRuleChain[id]();
        },

        destroy() {
          // we do not need to validate this message node anymore
          if (id in alertNodes) alertNodes[id].destroy();
        }
      };
    },

    // submit = OK()
    OK() {
      // re-run all the runRuleChains (closures) to make sure we have them all
      return Object.values(runRuleChain).reduce((a, c) => !c() && a, true);
    },

    Clear() {
      // clear errors to finalize the reset
      Object.values(nodeContext).forEach((ctx) => setNotValid(ctx, false, ""));
    },

    // add a validator function
    addValidator(validator, func) {
      if (validators[validator] === undefined) validators[validator] = func;
    },
  };

}
