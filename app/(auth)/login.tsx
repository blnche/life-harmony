import React, { useState } from 'react'
import { Platform, Alert, StyleSheet, View, SafeAreaView } from 'react-native'
import { supabase } from '../../utils/supabase'
import { Button, Input, Label } from 'tamagui'
import { Auth as NativeAuth } from '~/components/Auth.native';

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize={'none'}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={'none'}
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button disabled={loading} onPress={() => signInWithEmail()}>Sign in</Button>
        </View>
        <View style={styles.verticallySpaced}>
          <Button disabled={loading} onPress={() => signUpWithEmail()}>Sign up</Button>
        </View>
      </View>
      <View>
        {/* <NativeAuth /> */}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})