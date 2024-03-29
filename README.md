# use-validate example

A Svelte-Vite SPA to validate an example form using runes  
Example use of : [@voscausa/svelte-use-validate](https://github.com/voscausa/svelte-use-validate)

![example](./example%20form.png)

### <b>Example config rules</b>

```js
const rulesConfig = {
  day: ["required", { range: { min: 1, max: 31 } }, "dayOk"],
  month: ["required", { range: { min: 1, max: 12 } }],
  name: [
    "required",
    { len: { operator: ">=", len: 5, msg: "length must be at least 5 characters" } },
  ],
  experience: "required",
  html: "get", // if html we require css
  css: "get", // get bool
  jsSkills: "get",
  js: "updateJsSkillRules", // if js we require jsSkills
  other: { wordCount: { count: 5, msg: "include at least 5 other skills" } },
};
```
### <b>Validate instance config</b>

```js
// initialize the validation instance with node.name as the default id
const { field, OK, Clear, addValidator } = validate(
  // markDefault 0: no-border and no-text, 1: red-border 2: text 3: red-border and text
  { rulesConfig, lazy: true, markDefault: 3, alertBelow: 0 }, // callback not used
);
```
- field: use:field={binding, control} action
- OK: OK() to validate all fields  
- Clear: Clear() to clear all validation errors  
- addValidator: to add a custom validator   

### <b>Custom validators</b>

```js
// add a basic validator with setNotValid marker
addValidator("wordCount", function (options, setNotValid) {
  let { count = 2, msg = `number of words min ${count}` } = options;
  const valid = this.value.split(" ").length >= count;
  return setNotValid(this, !valid, msg);
});
```
Toggle between "required" and "get" rules controlled by "js" field value.
```js
// add a validator which updates jsSkill rules based on js bool
addValidator("updateJsSkillRules", function () {
  if ("jsSkills" in this.ruleChains)
    this.ruleChains.jsSkills(
      // require skill for js
      this.value ? "required" : "get"
    );
  // this section validator is always OK, so return false
  return false;
});
```
### <b>Example "date" HTML snippet</b>

```html
<div class="formgrid">
  <div class="bar-inputs">
    <input
      class="center"
      id="day"
      size="1"
      name="day"
      type="text"
      use:field={{ value: day, controls: [year, month] }}
      bind:value={day}
      placeholder="dd" />
    -
    <input
      class="center"
      id="month"
      size="1"
      name="month"
      type="text"
      use:field={month}
      bind:value={month}
      placeholder="mm" />
    - {year}
  </div>
  <div class="label">date</div>
  ...
</div>  
```