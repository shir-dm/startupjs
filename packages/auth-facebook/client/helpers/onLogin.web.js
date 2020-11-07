import { Linking } from 'react-native'
import { WEB_LOGIN_URL } from '../../isomorphic/constants'

export default async function onLogin () {
  Linking.openURL(WEB_LOGIN_URL)
}
