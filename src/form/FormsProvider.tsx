import React, {
  EventHandler,
  SyntheticEvent,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from "react"
import { noop } from "lodash"
import { FormType } from "./Form"
import { FormsContext } from "./FormsContext"
import { FormValueType } from "."

type FormsProviderProps = {}
type RegisterFormType = (id: string) => void
type GetFormValuesType = (id: string) => FormType
type SetValueType = (id: string, value: FormValueType) => void
type SetValuesType = (id: string, values: FormType) => void
type GetHandlers = (id: string) => {
  reset: EventHandler<SyntheticEvent>
  submit: EventHandler<SyntheticEvent>
}
type RegisterEventHandlers = (
  id: string,
  handlers: {
    reset: EventHandler<SyntheticEvent>
    submit: EventHandler<SyntheticEvent>
  }
) => void

type RegisterAction = { type: "register"; payload: { id: string } }
type SetOneAction = {
  type: "setOne"
  payload: { id: string; value: FormValueType }
}
type SetAllAction = {
  type: "setAll"
  payload: { id: string; values: FormType }
}
type Action = RegisterAction | SetOneAction | SetAllAction
const reducer = (
  state: Record<string, FormType> = {},
  action: Action
): Record<string, FormType> => {
  switch (action.type) {
    case "register":
      return { ...state, [action.payload.id]: {} }
    case "setOne":
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          [action.payload.value.name]: action.payload.value,
        },
      }
    case "setAll":
      return {
        ...state,
        [action.payload.id]: action.payload.values,
      }
  }
  return state
}

const FormsProvider: React.FC<FormsProviderProps> = ({ children }) => {
  const [forms, dispatch] = useReducer(reducer, {})
  const [eventHandlers, setEventHandlers] = useState<
    Record<
      string,
      {
        reset: EventHandler<SyntheticEvent>
        submit: EventHandler<SyntheticEvent>
      }
    >
  >({})

  const registerForm = useCallback<RegisterFormType>((id) => {
    dispatch({ type: "register", payload: { id } })
  }, [])

  const getValues = useCallback<GetFormValuesType>(
    (id) => {
      return forms[id] ?? {}
    },
    [forms]
  )
  const setValue = useCallback<SetValueType>((id, value) => {
    dispatch({
      type: "setOne",
      payload: {
        id,
        value,
      },
    })
  }, [])
  const setValues = useCallback<SetValuesType>((id, values) => {
    dispatch({
      type: "setAll",
      payload: {
        id,
        values,
      },
    })
  }, [])

  const getHandlers = useCallback<GetHandlers>(
    (id) => {
      const handlers = eventHandlers[id]
      if (!handlers) {
        return { reset: noop, submit: noop }
      }
      return handlers
    },
    [eventHandlers]
  )
  const registerEventHandlers = useCallback<RegisterEventHandlers>(
    (id, handlers) => {
      delete eventHandlers[id]
      eventHandlers[id] = handlers
      setEventHandlers(eventHandlers)
    },
    [eventHandlers, setEventHandlers]
  )

  const ctxValue = useMemo(
    () => ({
      eventHandlers,
      forms,
      getHandlers,
      getValues,
      registerEventHandlers,
      registerForm,
      setValue,
      setValues,
    }),
    [forms, eventHandlers]
  )

  return (
    <FormsContext.Provider value={ctxValue}>{children}</FormsContext.Provider>
  )
}

export { FormsProvider, FormsProviderProps }
