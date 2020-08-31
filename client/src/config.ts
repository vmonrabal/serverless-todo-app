// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'dlnp2n0uvg'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`
//export const apiEndpoint = `http://localhost:3003`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-34g5e566.eu.auth0.com',            // Auth0 domain
  clientId: 'FoH35b60uv35lTvC4FWBNybfyWc90WW1',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
