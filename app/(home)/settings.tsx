import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { StyleSheet, View, Alert, Button, Text, TextInput } from 'react-native'
// import { Button, TextInput, Text } from 'tamagui'
import { Session } from '@supabase/supabase-js'
import { useAuth } from '~/providers/AuthProvider'
import { Stack } from 'expo-router'

export default function ProfileScreen() {
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')


  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username
  }: {
    username: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Settings'}}/>
      <View style={styles.container}>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Text>Email</Text>
          <TextInput id="email" placeholder={session?.user?.email} value={session?.user?.email} disabled />
        </View>
        <View style={styles.verticallySpaced}>
          <Text>Username</Text>
          <TextInput id="Username" placeholder={username} value={username || ''} onChangeText={(text) => setUsername(text)} />
        </View>
       

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            onPress={() => updateProfile({ username })}
            disabled={loading}
            title={loading ? 'Loading ...' : 'Update'}
          />
        </View>

        <View style={styles.verticallySpaced}>
          <Button 
            onPress={() => supabase.auth.signOut()}
            title="Sign Out"
          />
        </View>
      </View>
    </>
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