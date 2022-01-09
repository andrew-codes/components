import * as React from "react"
import { mount } from "@cypress/react"

it("Button", () => {
  mount(<div>Test</div>)
  cy.get("div").contains("Test").click()
})
