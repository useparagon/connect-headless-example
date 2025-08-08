# Actions Playground Demo

![Actions Playground](/static/[Connect%20Headless%20Example]%202025-08-08%20at%2002.04.32%20AM@2x.png)

This app provides an Action Builder UI (to use in [embedded workflow builders](https://www.useparagon.com/learn/implement-a-workflow-builder-with-3rd-party-actions/)) that allows users to:
- Pick an integration and action to configure
- Fill out required inputs to configure the action (e.g. "Recipient" for Slack: Send Direct Message)
- Run the action and see the result


This demo is forked from our Headless Connect Portal example, found in the `main` branch of this repository.

## Setup

To run locally, clone the repository and install dependencies:

```bash
cd connect-headless-example/
npm install
```

Copy the .env-example file into .env and set your values:
```bash
cp .env-example .env
```
- `VITE_PARAGON_PROJECT_ID` can be found in your Paragon dashboard ([docs](https://docs.useparagon.com/getting-started/installing-the-connect-sdk#how-do-i-find-my-project-id)).
- `VITE_PARAGON_JWT_TOKEN` can be generated based on your project's [Signing Key](https://docs.useparagon.com/getting-started/installing-the-connect-sdk#1-generate-a-paragon-signing-key) using our browser-based [JWT debugger](https://jwt.useparagon.com).

Run the app locally (defaults to listening on port 5173):

```
npm run dev
```

> [!NOTE]  
> This app will only use the integrations that have been [added and enabled](https://docs.useparagon.com/getting-started/adding-an-integration#adding-integrations) in the Paragon Project that you are referencing from the environment config. 

## Implementation Overview

This implementation demonstrates the use of:
- [**Headless Connect Portal**](https://docs.useparagon.com/connect-portal/headless-connect-portal): To drive the authentication / setup process for each integration and render integration-dynamic UI.
- [**ActionKit API**](https://docs.useparagon.com/actionkit/overview): To discover and run Actions.

Here are some of the core functions of the app to explore as a starting point for your own workflow builder implementation:

### Integration authentication / setup flow

[**See the code &rarr;**](https://github.com/useparagon/connect-headless-example/blob/d050a9afb3a955ff7fe3240bcc68ac3e99ae8b8b/src/components/feature/integration/integration-modal/integration-modal.tsx#L33)


![Jira install flow of Headless Connect Portal](/static/[Connect%20Headless%20Example]%202025-08-08%20at%2002.26.33%20AM.gif)

To connect a user's integration account, we use the Headless Connect Portal to make the connection process seamless and native to the UI language of the rest of the demo app.

This flow is implemented in the `IntegrationModal` component This component can also be forked and used directly in your own React app.

---

### Listing available Actions

[**See the code &rarr;**](https://github.com/useparagon/connect-headless-example/blob/actionkit/src/components/feature/action-tester.tsx#L54-L71)


We use the ActionKit [**List Actions endpoint**](https://docs.useparagon.com/actionkit/api-reference#list-actions) to query available Actions and schemas for a selected integration. 

ActionKit provides a title and description for each Action that can be used to present available Actions to a user.

---

### Rendering inputs from Action schemas

[**See the code &rarr;**](https://github.com/useparagon/connect-headless-example/blob/actionkit/src/components/feature/serialized-connect-input-picker.tsx)

With the [Action schema](https://docs.useparagon.com/actionkit/schema-formats#paragon-format) that we pulled from the API, we can render inputs for users to configure their Action.

The renderer is implemented in `SerializedConnectInputPicker`, which can render the input types described in [the documentation](https://docs.useparagon.com/actionkit/schema-formats#overview). You can use this component directly or a starting point in your own app. 

---

**Loading dynamic options**

[**See the code &rarr;**](https://github.com/useparagon/connect-headless-example/blob/actionkit/src/components/feature/dynamic-enum.tsx#L18-L24)

When inputs should render a dynamic list of integration data (like a Recipient list from Slack or a Folder list from Google Drive), the `SerializedConnectInputPicker` component uses the Headless Connect Portal `getFieldOptions` function to load available options for the user. 

> [!NOTE]  
> Inputs from the ActionKit API schema currently do not include their corresponding `sourceType`, which is mapped in the demo [here](https://github.com/useparagon/connect-headless-example/blob/actionkit/src/components/feature/action-tester.tsx#L354-L370).

### Running Actions

[**See the code &rarr;**](https://github.com/useparagon/connect-headless-example/blob/actionkit/src/components/feature/action-tester.tsx#L128-L154)

When Actions are configured and the user is ready to run, we use the ActionKit [Run Action endpoint](https://docs.useparagon.com/actionkit/api-reference#run-action) to send the request with the Action name and configuration.

ActionKit API automatically handles authentication and secure token refresh with the integration in the background.


