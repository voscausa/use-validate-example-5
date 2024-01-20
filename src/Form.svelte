<script>
	import { validate } from '$lib/validate.svelte.js';

	let { close } = $props();

	let restart = $state(false);
	let submitOK = $state(true);

	const year = new Date().getFullYear();

	// field value defaults
	const history = {
		day: '',
		month: '',
		name: '',
		experience: '',
		html: false,
		css: false,
		js: false,
		jsSkills: '',
		other: ''
	};

	let { day, month, name, experience, html, css, js, jsSkills, other } = $state({ ...history });

	const rulesConfig = {
		day: ['required', { range: { min: 1, max: 31 } }, 'dayOk'],
		month: ['required', { range: { min: 1, max: 12 } }],
		name: [
			'required',
			{ len: { operator: '>=', len: 5, msg: 'length must be at least 5 characters' } }
		],
		experience: 'required',
		html: 'get', // if html we require css
		css: 'get', // get bool
		jsSkills: 'get',
		js: 'updateJsSkillRules', // if js we require jsSkills
		other: { wordCount: { count: 5, msg: 'include at least 5 other skills' } }
	};

	$effect(() => {
		// reset optional fields
		if (!html) css = history.css;
		if (!js) jsSkills = history.jsSkills;
	});

	const notValidMarkers = {}; // not used
	// initialize the validation instance with node.name as the default id
	const { field, OK, Clear, addValidator, fieldValues, runRuleChain, setNotValid } = validate(
		// markDefault 0: no-border and no-text, 1: red-border 2: text 3: red-border and text
		{ rulesConfig, lazy: true, markDefault: 3, alertBelow: 0 }
	);

	// add a basic validator with setNotValid marker
	addValidator('wordCount', function (obj) {
		let { count = 2, msg = `number of words min ${count}` } = obj;
		const valid = this.value.split(' ').length >= count;
		return setNotValid(this, !valid, msg);
	});

	// add a validator which updates jsSkill rules based on js bool
	addValidator('updateJsSkillRules', function () {
		if ('jsSkills' in runRuleChain)
			runRuleChain.jsSkills(
				// require skill for js
				this.value ? 'required' : 'get'
			);
		// this section validator is always OK, so return false
		return false;
	});

	// reset values and clear errors
	function reset() {
		({ day, month, name, experience, html, css, js, jsSkills, other } = history);
		Clear();
		submitOK = true;
	}

	function commitForm() {
		submitOK = OK();
		console.log('submit: check all rules using OK()', submitOK);
		if (submitOK) {
			console.log('validation OK result', { ...fieldValues });
			close();
		}
		return false;
	}

	$inspect('values', fieldValues, submitOK);
</script>

<button class="right" onclick={close}>Close</button>

<form id="myform" action="get">
	<fieldset>
		<legend><h3>Svelte-5 Use Validate Example</h3></legend>

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
					placeholder="dd"
				/>
				-
				<input
					class="center"
					id="month"
					size="1"
					name="month"
					type="text"
					use:field={month}
					bind:value={month}
					placeholder="mm"
				/>
				- {year}
			</div>
			<div class="label">Date</div>

			<input id="name" name="name" type="text" use:field={name} bind:value={name} />
			<label for="name">Name</label>

			<select id="experience" name="experience" use:field={experience} bind:value={experience}>
				<option value="">select experience option</option>
				<option value="1">1 year or less</option>
				<option value="2">2 years</option>
				<option value="3">3 - 4 years</option>
				<option value="5">5 years or more</option>
			</select>
			<label for="experience">Experience</label>

			<input id="html" name="html" type="checkbox" use:field={html} bind:checked={html} />
			<label for="html">HTML</label>

			<input
				id="css"
				name="css"
				type="checkbox"
				class:hidden={html === false}
				use:field={css}
				bind:checked={css}
			/>
			<label for="css">CSS (optional)</label>

			<input id="js" name="js" type="checkbox" use:field={js} bind:checked={js} />
			<label for="js">Javascript</label>

			<select
				id="jsSkills"
				name="jsSkills"
				class:hidden={js === false}
				use:field={jsSkills}
				bind:value={jsSkills}
			>
				<option value="">select skill option</option>
				<option value="1">node server side</option>
				<option value="2">browser / V8 client side</option>
				<option value="3">Client + server side</option>
			</select>
			<label for="experience">Js skills (optional)</label>

			<textarea id="other" name="other" rows="6" cols="20" use:field={other} bind:value={other} />
			<label for="other">Other skills</label>

			<div class="bar-inputs bar">
				<button type="reset" on:click|preventDefault={reset}>Reset</button>
				<div class:submit-ok={submitOK} class="submit-nok"><b>Submit NOT OK</b></div>
				<button type="submit" on:click|preventDefault={commitForm}>Submit</button>
			</div>
			<div class="label">Form</div>
			<div class="bar-inputs">console logs contain validated fieldValues</div>
		</div>
	</fieldset>
</form>

<style>
	* {
		box-sizing: border-box;
	}
	.right {
		float: right;
	}
	legend {
		margin: 1em auto;
		text-align: center;
	}
	fieldset {
		max-width: 40em;
		padding: 4px;
		margin: 2em auto;
		border: 0 none;
	}
	legend {
		font-size: 1.2em;
		width: 100%;
		border-bottom: 1px dotted #99c;
	}
	input,
	textarea,
	select {
		padding: 0.2em 0.4em;
		margin: 0.2em 0;
		outline: 0 none;
		border: 1px solid;
	}
	button {
		max-width: 9em;
		padding: 0.2em 2em;
		cursor: pointer;
		border: 1px solid black;
	}
	label,
	.label {
		box-sizing: border-box;
		user-select: none;
		cursor: pointer;
	}
	.bar-inputs:focus-within + .label,
	input:focus + label,
	textarea:focus + label,
	select:focus + label {
		text-decoration: underline;
	}
	.float-right {
		float: right !important;
	}
	.center {
		text-align: center;
	}
	.hidden {
		visibility: hidden;
	}
	.submit-ok {
		visibility: hidden;
	}
	.submit-nok {
		color: red;
	}
	/* grid layout */
	.formgrid {
		display: grid;
		grid-template-columns: 1fr 1em 3fr;
		grid-gap: 1.5em 0.6em;
		justify-items: start;
		grid-auto-flow: column;
	}

	input,
	textarea,
	select,
	.bar-inputs {
		grid-column: 2 / 4;
		width: auto;
		margin: 0;
	}
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
</style>
