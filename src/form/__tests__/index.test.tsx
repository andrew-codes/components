import * as React from "react"
import { mount } from "@cypress/react"
import styled from "styled-components"
import {
  Field,
  Form,
  FormsProvider,
  FormType,
  FormValueType,
  useForm,
  ValidityType,
} from ".."
import { useState } from "react"
import {
  ChangeType,
  useValidationRule,
  ValidateType,
} from "../useValidationRule"

const SampleTextField = styled.input.attrs(
  ({ onChange, onBlur, defaultValue, value }) => ({
    onChange: (evt) => onChange(evt, evt.target.value),
    onBlur: (evt) => onBlur(evt),
    defaultValue,
    value,
  })
)`
  border: 1px solid ${({ valid }) => (valid === false ? "red" : "black")};
  background-color: ${({ touched }) => (touched ? "yellow" : "white")};
`

const ColoredBackground = styled.div`
  background-color: light-blue;
`

const BasicForm: React.FC<{
  id: string
  validate?: ValidateType
  changeType?: ChangeType
}> = ({ changeType, id, validate }) => {
  const { reset, submit, values } = useForm(id)
  const [isSubmitted, setSubmission] = useState(false)
  const handleReset = React.useCallback(
    (evt) => setSubmission(false),
    [setSubmission]
  )
  const handleSubmit = React.useCallback(
    (evt) => setSubmission(true),
    [setSubmission]
  )
  let validateFirstName = useValidationRule(
    "invalid",
    (value: FormValueType, values: FormType) => true
  )
  if (validate) {
    validateFirstName = useValidationRule("invalid", validate, changeType)
  }

  return (
    <>
      <Form id={id} onSubmit={handleSubmit} onReset={handleReset}>
        <Field
          as={SampleTextField}
          label="First Name"
          name="firstName"
          validate={validateFirstName}
        ></Field>
        <Field as={SampleTextField} label="Last Name" name="lastName"></Field>
        <Field as={SampleTextField} label="Full Name" name="fullName"></Field>
        {values?.fullName?.value && (
          <Field as={SampleTextField} label="Suffix" name="suffix"></Field>
        )}
        <ColoredBackground>
          <button onClick={reset} type="button">
            Reset
          </button>
          <button onClick={submit} type="button">
            Submit
          </button>
        </ColoredBackground>
      </Form>
      {isSubmitted && (
        <div data-test="summary">
          {Object.entries(values).map(([name, value]) => (
            <div key={name}>
              <span>{name}: </span>
              <span>{value.value}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

describe("Form", () => {
  it("can render a form", () => {
    mount(
      <FormsProvider>
        <BasicForm id="Form1" />
      </FormsProvider>
    )

    cy.get("button").contains("Reset")
    cy.get("button").contains("Submit")
  })

  it("can render a form with form fields that collect user input", () => {
    mount(
      <FormsProvider>
        <BasicForm id="Form1" />
      </FormsProvider>
    )
    cy.get("input").as("inputs").eq(0).type("x")
    cy.get("@inputs").eq(1).type("y")
    cy.get("@inputs").eq(2).type("z")

    cy.get("@inputs").eq(0).should("have.value", "x")
    cy.get("@inputs").eq(1).should("have.value", "y")
    cy.get("@inputs").eq(2).should("have.value", "z")
  })

  it("resetting form will clear all its fields of values and mark each as not touched", () => {
    mount(
      <FormsProvider>
        <BasicForm id="Form1" />
      </FormsProvider>
    )
    cy.get("input").as("inputs").eq(0).type("x")
    cy.get("@inputs").eq(1).type("y")
    cy.get("@inputs").eq(2).type("z")
    cy.get("button").contains("Reset").click()

    cy.get("@inputs").eq(0).should("have.value", "")
    cy.get("@inputs").eq(1).should("have.value", "")
    cy.get("@inputs").eq(2).should("have.value", "")
  })

  it("submitting a valid form", () => {
    mount(
      <FormsProvider>
        <BasicForm id="Form1" />
      </FormsProvider>
    )
    cy.get("input").as("inputs").eq(0).type("x")
    cy.get("@inputs").eq(1).type("y")
    cy.get("@inputs").eq(2).type("z")
    cy.get("button").contains("Submit").click()

    cy.get("[data-test='summary']>div")
      .as("summaries")
      .eq(0)
      .should("contain", "firstName")
      .should("contain", "x")
    cy.get("@summaries")
      .eq(1)
      .should("contain", "lastName")
      .should("contain", "y")
    cy.get("@summaries")
      .eq(2)
      .should("contain", "fullName")
      .should("contain", "z")
  })

  it("empty forms are considered invalid and therefore not submittable", () => {
    mount(
      <FormsProvider>
        <BasicForm id="Form1" />
      </FormsProvider>
    )
    cy.get("button").contains("Submit").click()

    cy.get("[data-test='summary']").should("not.exist").as("summaries")
  })

  it("invalid forms are not submittable", () => {
    mount(
      <FormsProvider>
        <BasicForm
          id="Form1"
          validate={(value: FormValueType) => value.value === "x"}
        />
      </FormsProvider>
    )
    cy.get("input").as("inputs").eq(0).type("y")
    cy.get("@inputs").eq(1).type("y")
    cy.get("@inputs").eq(2).type("z")
    cy.get("button").contains("Submit").as("submit").click()

    cy.get("[data-test='summary']")
      .as("summary")
      .should("not.exist")
      .as("summaries")
  })

  it("invalid forms that become valid can be submitted", () => {
    mount(
      <FormsProvider>
        <BasicForm
          id="Form1"
          validate={(value: FormValueType) => value.value === "x"}
        />
      </FormsProvider>
    )
    cy.get("input").as("inputs").eq(0).type("xy")
    cy.get("@inputs").eq(1).type("y")
    cy.get("@inputs").eq(2).type("z")
    cy.get("button").contains("Submit").as("submit").click()

    cy.get("[data-test='summary']").should("not.exist")

    cy.get("@inputs").eq(0).type("{backspace}")
    cy.get("@submit").click()
    cy.get("[data-test='summary']").find("div").eq(0).should("contain", "x")
  })

  it("fields can be validated on change", () => {
    mount(
      <FormsProvider>
        <BasicForm
          id="Form1"
          validate={(value: FormValueType) => value.value === "x"}
        />
      </FormsProvider>
    )
    cy.get("input").as("inputs").eq(0).type("xy")
    cy.get('input[value="xy"]').siblings().eq(1).should("contain", "invalid")
  })

  it("fields can be validated on blur and not on change", () => {
    mount(
      <FormsProvider>
        <BasicForm
          id="Form1"
          validate={(value) => value.value === "x"}
          changeType="blur"
        />
      </FormsProvider>
    )
    cy.get("input").eq(0).as("input").type("xy")
    cy.get('input[value="xy"]').siblings().eq(1).should("not.exist")
    cy.get("@input").blur()
    cy.get('input[value="xy"]').siblings().eq(1).should("contain", "invalid")
  })

  it("submission will validate all fields", () => {
    mount(
      <FormsProvider>
        <BasicForm
          id="Form1"
          validate={(value, values) =>
            !values["fullName"]?.value && value.value === "x"
          }
          changeType="change"
        />
      </FormsProvider>
    )
    cy.get("input").as("inputs").eq(0).type("x")
    cy.get("@inputs").eq(1).type("y")
    cy.get("@inputs").eq(2).type("z")
    cy.get("button").contains("Submit").click()
    cy.get("[data-test='summary']").should("not.exist")
  })

  it("can conditionally render fields based on form values", () => {
    mount(
      <FormsProvider>
        <BasicForm id="Form1" />
      </FormsProvider>
    )
    cy.get("input").eq(2).as("input").type("x")
    cy.get("input").parent().contains("Suffix")
  })

  it("can conditionally validate fields based on form values", () => {
    mount(
      <FormsProvider>
        <BasicForm
          id="Form1"
          validate={(value, values) =>
            !values["fullName"]?.value && value.value !== ""
          }
          changeType="change"
        />
      </FormsProvider>
    )
    cy.get("input").eq(2).as("input").type("x")
    cy.get("input").parent().contains("Suffix")
    cy.get("button").contains("Submit").click()
    cy.get("[data-test='summary']").should("not.exist")
  })

  it("multiple forms' reset function not interfere with each other", () => {
    mount(
      <FormsProvider>
        <div data-test="form1">
          <BasicForm id="form1" />
        </div>
        <div data-test="form2">
          <BasicForm id="form2" />
        </div>
      </FormsProvider>
    )
    cy.get("[data-test='form1']")
      .as("form1")
      .find("input")
      .as("inputs")
      .eq(0)
      .type("x")
    cy.get("@inputs").eq(1).type("y")
    cy.get("@inputs").eq(2).type("xy")
    cy.get("[data-test='form2']")
      .as("form2")
      .find("input")
      .as("inputs")
      .eq(0)
      .type("a")
    cy.get("@form1").find("button").contains("Submit").click()
    cy.get("@form2").find("button").contains("Submit").click()
    cy.get("@form2").find("button").contains("Reset").click()
    cy.get("@form1").find("button").contains("Reset").click()
    cy.get("@form2").find("button").contains("Reset").click()

    cy.get("input").should("have.value", "")
  })

  it("multiple forms' validation and submissions do not interfere with each other", () => {
    mount(
      <FormsProvider>
        <div data-test="form1">
          <BasicForm id="form1" />
        </div>
        <div data-test="form2">
          <BasicForm id="form2" />
        </div>
      </FormsProvider>
    )
    cy.get("[data-test='form1']")
      .as("form1")
      .find("input")
      .as("inputs")
      .eq(0)
      .type("x")
    cy.get("@inputs").eq(1).type("y")
    cy.get("@inputs").eq(2).type("z")
    cy.get("@form1").find("button").contains("Submit").click()
    cy.get("[data-test='form2']").as("form2")
    cy.get("@form2").find("button").contains("Submit").click()

    cy.get("@form1")
      .find("[data-test='summary']>div")
      .as("summaries")
      .eq(0)
      .should("contain", "firstName")
      .should("contain", "x")
    cy.get("@summaries")
      .eq(1)
      .should("contain", "lastName")
      .should("contain", "y")
    cy.get("@summaries")
      .eq(2)
      .should("contain", "fullName")
      .should("contain", "z")
    cy.get("@form2").find("[data-test='summary']").should("not.exist")
  })
})
