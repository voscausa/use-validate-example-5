import { validIBAN } from "./validIban";
import { validAlert } from "./validAlert";

const intRex = new RegExp("[,\\.]", "g");

// convert to date and back to check if the day result matches the input
export const validDay = ({ day, month, year }) => {
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number(day) === date.getDate() && Number(month) === date.getMonth() + 1;
};

export function getValidators(alertBelow, alertNodes) { // validObj not used yet
  // use validating addValidator() to add dynamic validators

  // initialize alertObj instance
  const alert = validAlert(alertBelow);

  // default error marker 
  function markError(ctx, notValid) {
    Object.assign(ctx.node.style, {
      "border-color": notValid ? "red" : "initial",
      "outline": notValid ? "0" : "initial"
    });
    return notValid;
  }

  // mark 0: no-border and no-text, 1: red-border 2: text 3: red-border and text
  function setNotValid(ctx, notValid, msg = "warning ?") {
    if (ctx.mark >= 2) {
      // show a message below the field node
      if (ctx.id in alertNodes) alertNodes[ctx.id].update(notValid ? msg : "");
      else alertNodes[ctx.id] = alert(ctx.node, [notValid ? msg : "", true]);
    }
    return (ctx.mark % 2) ? markError(ctx, notValid) : notValid;
    // we can test for mark = func (alt error marker);
  }

  // rule format: {validator: {arguments...} } 
  // runRuleChain will then run: validator(arguments) with ctx
  return [
    {

      // signed numeric string / string isNot a Number 
      cents: function ({ trimZero = true, msg = "not a valid amount" }) {
        const { value = "" } = this;
        this.value = value.replace(intRex, "");
        const notValid = isNaN(parseInt(this.value));
        if (!notValid && trimZero) this.value = `${parseInt(this.value)}`;
        return setNotValid(this, notValid, msg);
      },

      // form a date and check if the result contains a valid day
      dayOk: function ({ msg = "not a valid day!!!!" }) {
        // ctx (this): this.value, this.node, this.controls [array]
        // month control value to check if we have an existing date like feb 29 
        const { value: day, controls: [year, month] } = this;
        const notValid = (month && !isNaN(month))
          ? !validDay({ year, month, day })
          : false;
        return setNotValid(this, notValid, msg);
      },

      // run validation function
      func: function ({ fn = () => { }, msg = "function validation failed" }) {
        const notValid = fn(this.value);
        return setNotValid(this, notValid, msg);
      },

      // string length. between: combine two len"s
      len: function ({ operator = "==", len = 0, msg = "current length invalid" }) {
        const valid = {
          ">=": () => this.value.length >= len,
          "<=": () => this.value.length <= len,
          "==": () => this.value.length === len,
          "!=": () => this.value.length !== len
        }[operator]();
        return setNotValid(this, !valid, msg);
      },

      // numeric string value within range (>= min, <= max)
      range: function ({ min = 0, max = 0, trimZero = true, msg = "out of range" }) {
        const valid = !isNaN(this.value) && parseInt(this.value) >= min && parseInt(this.value) <= max;
        if (valid && trimZero) this.value = `${parseInt(this.value)}`;
        return setNotValid(this, !valid, msg);
      },

      // required string, length > 0
      required: function ({ msg = "required" }) {
        let notValid = [null, undefined].includes(this.value);
        if (!notValid) {
          this.value = ("" + this.value).trim();
          notValid = (this.value.length <= 0);
        }
        return setNotValid(this, notValid, msg);
      },

      // regex test, default test for numeric digits
      rex: function ({ pattern = "(d)*", flags = "iu", msg = "value failed rex test" }) {
        const regex = new RegExp(pattern, flags);
        const valid = regex.test(this.value);
        return setNotValid(this, !valid, msg);
      },

      // validator for iban number
      ibanNum: function ({ msg = "not a valid IBAN" }) {
        const valid = validIBAN(this.value);
        return setNotValid(this, !valid, msg);
      },

      // get always ok, so clear marked inputs and messages
      get: function ({ value = undefined }) {
        if (this.value === undefined) this.value = value;
        return setNotValid(this, false, "");
      }
    },
    setNotValid
  ];
}
