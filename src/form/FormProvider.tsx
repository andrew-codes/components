import React from "react"
import { FormContext } from "./FormContext"

type FormProviderProps = { id: string }

const FormProvider: React.FC<FormProviderProps> = ({ children, id }) => (
  <FormContext.Provider value={id}>{children}</FormContext.Provider>
)

export { FormProvider, FormProviderProps }
