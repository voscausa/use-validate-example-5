import { getValidators, validDay } from "./validators";
export { validDay };

const isObj = obj => typeof obj === "object" && !Array.isArray(obj);

// Validator for use: field={obj} and adds function OK() and values 
export function validate(config, callback = null) { // callback depricated

  // mark 0: no-border and no-text, 1: red-border 2: text 3: red-border and text
  const { rulesConfig, nodeKey = "name", lazy = true, markDefault = 3, alertBelow = 0 } = config;

  const ruleChains = {};  // ruleChains {[id]: closure} to rerun validation or update chain
  const nodeContext = {}; // used to clear error nodes: reset setNotValid
  const alertNodes = {};  // alert msg nodes

  const [setNotValid, validators] = getValidators(alertBelow, alertNodes);

  return {
    field(node, obj) {
      // value = object (and not an array object) or value or values array
      // examples: {value: value, mark: false, controls: [control values] } or value
      // optional control values to control the validator behaviour
      let { value, id = node[nodeKey], mark = markDefault, controls = [] } =
        isObj(obj) ? obj : { value: obj };

      if (!id) console.log(`validate nodekey ${nodeKey} missing in node`, node, obj);
      let ruleChain = rulesConfig[id]; // enclose ruleChain

      // inner closure to validate node value: apply rule chain (array / chain of rules)
      ruleChains[id] = (altRuleChain = null) => {
        if (altRuleChain !== null) ruleChain = altRuleChain;

        let notValid = false;
        // run the rulechain array for each rule until (break) not valid or all rules are valid 
        // rule { validator: { options } } or chain: [validator obj, ..] or "validator"
        for (const rule of Array.isArray(ruleChain) ? ruleChain : [ruleChain]) {
          const [validator, options] = (typeof rule === "object") ? Object.entries(rule)[0] : [rule, {}];

          // validator ctx (becomes this context): {id, node, mark, value, [rest]}
          const ctx = { id, node, mark, value, ruleChains };
          // we allow an array of controls
          // use controls to pass addtional data to the the validator 
          ctx.controls = Array.isArray(controls) ? controls : [controls];
          nodeContext[id] = ctx;

          notValid = validators[validator].call(ctx, options, setNotValid);
          // break the chain if rul not valid
          if (notValid) break;
          // use the callback to update the value
          value = ctx.value;
        }

        // use callback to pass node validation result
        if (callback) callback({ id, notValid, value });

        return notValid;
      };

      if (!lazy) ruleChains[id]();

      return {
        // value update and optional controls update
        update(obj) {
          // value = object (and not an array object) or a value
          ({ value, controls =[] } = isObj(obj) ? obj : { value: obj });
          ruleChains[id]();
        },
        destroy() {
          // we do not need to validate this message node anymore
          if (id in alertNodes) alertNodes[id].destroy();
        }
      };
    },

    // submitOK = OK()
    OK() {
      // re-run all the ruleChains (closures) to make sure we have validated all fields
      return Object.values(ruleChains).reduce((a, c) => !c() && a, true);
    },

    Clear() {
      // finalize the reset: Clear errors
      setTimeout(() => Object.values(nodeContext).forEach((ctx) => {
        setNotValid(ctx, false, "");
      }), 0);
    },

    // add a custom validator function
    addValidator(validator, func) {
      if (validators[validator] === undefined) validators[validator] = func;
    },
  };

}
