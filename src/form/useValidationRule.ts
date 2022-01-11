import { useCallback } from "react"
import { FormType, FormValueType } from "./Form"

type ValidationOutputType = string | null
type ChangeType = "change" | "blur" | "any"
type ValidateType = (value: FormValueType, values: FormType) => boolean
type ValidationRuleType = (
  value: FormValueType,
  values: FormType,
  changeType: ChangeType
) => ValidationOutputType

const useValidationRule = (
  errorMessage: string,
  validate: ValidateType,
  changeType: ChangeType = "any"
) => {
  const rule = useCallback(
    (
      value: FormValueType,
      values: FormType,
      filterChangeType
    ): ValidationOutputType => {
      if (changeType === "any") {
        return validate(value, values) ? null : errorMessage
      }
      if (changeType === filterChangeType) {
        return validate(value, values) ? null : errorMessage
      }

      return null
    },
    [errorMessage, validate]
  )
  return rule
}

export {
  ChangeType,
  useValidationRule,
  ValidateType,
  ValidationOutputType,
  ValidationRuleType,
}
