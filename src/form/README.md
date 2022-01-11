# Usage

See [tests](./__tests__/index.test.tsx) for more usage details.

## Field Control API

API of a field's control used in the form. All form fields adhere to this API. We adapt any component of any library to this via an adapter component; if necessary; such as the `SampleTextField`.

```tsx
const SampleTextField = ({ onBlur, onChange, touched, value, valid }) => {
  const getBorderColor = () => {
    if (valid === ValidityType.valid) {
      return "green"
    }
    if (valid === ValidityType.invalid) {
      return "red"
    }
    if (touched) {
      return "blue"
    }
    return "black"
  }

  return (
    <input
      type="text"
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      style={{
        border: `1px solid ${getBorderColor()}`,
      }}
    />
  )
}
```

## Basic Form

Basic form; no unique validation or conditional fields. All fields must be touched before submission is allowed; meaning the `onSubmit` event handler will only fire after touching all fields and then submitting.

```tsx
const MyForm = (props) => {
    const formId = "myForm"
    const { reset, submit, values } = useForm(formId)

    const [isSubmitted, setSubmission] = useState(false)
    const handleReset = React.useCallback(
        (evt) => setSubmission(false),
        [setSubmission]
    )
    const handleSubmit = React.useCallback(
        (evt) => setSubmission(true),
        [setSubmission]
    )

    return (
    <>
        <Form id={formId} onSubmit={handleSubmit} onReset={handleReset}>
            <Field
                as={SampleTextField}
                label="First Name"
                name="firstName"
                defaultValue="a name"
             />
            <Field as={SampleTextField} label="Last Name" name="lastName" />
            <div>
                <button onClick={reset} type="button">
                  Reset
                </button>
                <button onClick={submit} type="button">
                  Submit
                </button>
            </div>
          </Form>
          {isSubmitted && (
            <div>
              {Object.entries(values).map(([name, value]) => (
                <div key={name}>
                  <span>{name}: </span>
                  <span>{value.value}</span>
                </div>
              ))}
            </div>
          )}
        )
    </>
}

render((
    <FormsProvider>
        <MyForm/>
    </FormsProvider>
    )
)
```

## Form With Validation

Form validation can happen on every change to a field, upon blurring the field, or both. Forms will **not** be submitted with invalid fields and therefore will not trigger the `onSubmit` event handler.

```tsx
const MyForm = (props) => {
  const formId = "myForm"
  const { reset, submit, values } = useForm(formId)

  const required = useValidation(
    "required field on change or blur",
    (field, values) => !!field.value
  )
  const requiredOnBlur = useValidation(
    "required on blur",
    (field, values) => !!field.value,
    "blur"
  )

  return (
    <Form id={formId} onSubmit={console.log} onReset={console.log}>
      <Field
        as={SampleTextField}
        label="First Name"
        name="firstName"
        validate={required}
      />
      <Field
        as={SampleTextField}
        label="Last Name"
        name="lastName"
        validate={requiredOnBlur}
      />
      <div>
        <button onClick={reset} type="button">
          Reset
        </button>
        <button onClick={submit} type="button">
          Submit
        </button>
      </div>
    </Form>
  )
}

render(
  <FormsProvider>
    <MyForm />
  </FormsProvider>
)
```

## Form with Conditional Fields and Conditional Validation

Validation can validate on the field's value or any other field value in the form. Because we have access to all form values, we can also conditionally render or configure fields based on previous fields' values.

```tsx
const MyForm = (props) => {
  const formId = "myForm"
  const { reset, submit, values } = useForm(formId)

  const requiredFirst = useValidation(
    "required first name",
    (field, values) => !!field.value && !values["fullName"]?.value
  )
  const requiredLast = useValidation(
    "required last name",
    (field, values) => !!field.value && !values["fullName"]?.value
  )
  const requiredFullName = useValidation(
    "required full name",
    (field, values) => {
      !!field.value ||
        (!!values["firstName"]?.value && !!values["lastName"]?.value)
    }
  )

  return (
    <Form id={formId} onSubmit={console.log} onReset={console.log}>
      <Field
        as={SampleTextField}
        label="First Name"
        name="firstName"
        validate={requiredFirst}
      />
      <Field
        as={SampleTextField}
        label="Last Name"
        name="lastName"
        validate={requiredLast}
      />
      {!values["firstName"]?.value && (
        <Field
          as={SampleTextField}
          label="fullName"
          name="fullName"
          validate={requiredFullName}
        />
      )}
      <div>
        <button onClick={reset} type="button">
          Reset
        </button>
        <button onClick={submit} type="button">
          Submit
        </button>
      </div>
    </Form>
  )
}

render(
  <FormsProvider>
    <MyForm />
  </FormsProvider>
)
```

## Improvements

- Make ValidityType a string of values instead of an enum; `"valid"`, `"invalid"`, and `"unknown"`
- always validate every field on form submission; not just on change/blur; add new `ChangeType` for submission for validations that should only happen on submission
- validation composition; support multiple discrete validation and messages in a single validate function via composition
- submission and reset status comes from hook; no need to `useState` and set in `onSubmit`/`onReset` callback. Do we even need these callbacks then?
