import { EventHandler, SyntheticEvent, useContext } from "react"
import { FormType } from "./Form"
import { FormsContext } from "./FormsContext"

type UseFormType = (id: string) => {
  reset: EventHandler<SyntheticEvent>
  submit: EventHandler<SyntheticEvent>
  values: FormType
}

const useForm: UseFormType = (id) => {
  const formsContext = useContext(FormsContext)
  const values = formsContext.getValues(id)
  const { reset, submit } = formsContext.getHandlers(id)

  return {
    reset,
    submit,
    values: values,
  }
}

export { useForm }
