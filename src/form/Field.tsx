import React, {
  EventHandler,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useContext,
} from "react"
import styled from "styled-components"
import { merge } from "lodash"
import { FormValueType, ValidityType } from "./Form"
import { FormContext } from "./FormContext"
import { FormsContext } from "./FormsContext"
import { ValidationRuleType } from "./useValidationRule"

const Aligned = styled.div`
  display: flex;
  flex: 1;
  align-self: flex-start;
  width: ${({ fullWidth, xs }) =>
    fullWidth ? `calc(100% - ${xs * 2}px)` : undefined};
`
const FieldLabel = styled(Aligned)`
  color: #6c798f;
`
const ErrorMessage = styled(Aligned)`
  background-color: pink;
`

type FieldEventHandlerType = (evt: SyntheticEvent, value: any) => void

type FormFieldComponentProps = {
  onBlur: FieldEventHandlerType
  onChange: FieldEventHandlerType
  value: any
  touched?: boolean
  valid?: ValidityType
}

interface FieldPropTypes {
  as: React.FC<FormFieldComponentProps>
  defaultValue?: string
  hintText?: string | ReactNode
  label: string
  name: string
  onBlur?: EventHandler<SyntheticEvent>
  onChange?: EventHandler<SyntheticEvent>
  validate?: ValidationRuleType
}

const generateDefaultValue: (name: string) => FormValueType = (name) => ({
  name,
  value: "",
  touched: false,
  validity: ValidityType.unknonwn,
  error: null,
})

const Field: React.FC<FieldPropTypes> = ({
  as,
  defaultValue,
  name,
  label,
  onBlur = (evt) => {},
  onChange = (evt) => {},
  validate,
  ...rest
}) => {
  const { getValues, setValue } = useContext(FormsContext)
  const id = useContext(FormContext)
  const values = getValues(id)
  const value = (values[name] as FormValueType) || generateDefaultValue(name)

  const handleBlur = useCallback<EventHandler<SyntheticEvent>>(
    (evt) => {
      const newValue = merge({}, value, { touched: true })
      let error = null
      if (!!validate) {
        error = validate(newValue, values, "blur")
      }
      newValue.error = error
      newValue.validity =
        error === null ? ValidityType.valid : ValidityType.invalid
      setValue(id, newValue)
      onBlur(evt)
    },
    [setValue, onBlur, id, value]
  )

  const handleChange = useCallback<FieldEventHandlerType>(
    (evt, v) => {
      const newValue: FormValueType = merge({}, value, {
        value: v,
      })
      let error = null
      if (!!validate) {
        error = validate(newValue, values, "change")
      }
      newValue.error = error
      newValue.validity =
        error === null ? ValidityType.valid : ValidityType.invalid
      setValue(id, newValue)
      onChange(evt)
    },
    [value, setValue, onChange, id]
  )

  const FormField = as

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <FormField
        {...rest}
        touched={value.touched}
        valid={value.validity}
        value={value.value}
        onBlur={handleBlur}
        onChange={handleChange}
      />
      {value.validity === ValidityType.invalid && (
        <ErrorMessage>{value.error}</ErrorMessage>
      )}
    </div>
  )
}

export { Field, FieldPropTypes }
