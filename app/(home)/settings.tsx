import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { Button, Input, Label } from 'tamagui'
import { Session } from '@supabase/supabase-js'
import { useAuth } from '~/providers/AuthProvider'
import { Stack } from 'expo-router'

export default function ProfileScreen() {
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')


  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
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
    username,
    website,
  }: {
    username: string
    website: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
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
          <Label htmlFor='email'>Email</Label>
          <Input id="email" placeholder={session?.user?.email} value={session?.user?.email} disabled />
        </View>
        <View style={styles.verticallySpaced}>
          <Label htmlFor='username'>Username</Label>
          <Input id="Username" placeholder={username} value={username || ''} onChangeText={(text) => setUsername(text)} />
        </View>
        <View style={styles.verticallySpaced}>
          <Label htmlFor='website'>Website</Label>
          <Input id="Website" value={website || ''} onChangeText={(text) => setWebsite(text)} />
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            onPress={() => updateProfile({ username, website })}
            disabled={loading}
          >{loading ? 'Loading ...' : 'Update'}</Button>
        </View>

        <View style={styles.verticallySpaced}>
          <Button onPress={() => supabase.auth.signOut()}>Sign Out</Button>
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