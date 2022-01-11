import { createContext, EventHandler, SyntheticEvent } from "react"
import { FormValueType } from "."
import { FormType } from "./Form"

type FormsContextType = {
  eventHandlers: Record<
    string,
    {
      submit?: EventHandler<SyntheticEvent>
      reset?: EventHandler<SyntheticEvent>
    }
  >
  forms: Record<string, FormType> | {}
  getHandlers: (id: string) => {
    submit: EventHandler<SyntheticEvent>
    reset: EventHandler<SyntheticEvent>
  }
  getValues: (id: string) => FormType | {}
  registerEventHandlers: (
    id: string,
    handlers: {
      submit: EventHandler<SyntheticEvent>
      reset: EventHandler<SyntheticEvent>
    }
  ) => void
  registerForm: (id: string) => void
  setValue: (id: string, value: FormValueType) => void
  setValues: (id: string, values: FormType) => void
}

const FormsContext = createContext<FormsContextType>({
  eventHandlers: {},
  forms: {},
  getHandlers: null,
  getValues: null,
  registerEventHandlers: null,
  registerForm: null,
  setValue: null,
  setValues: null,
})

export { FormsContext, FormsContextType }
