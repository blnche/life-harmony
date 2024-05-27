import { Stack } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { ScreenContent } from '~/components/ScreenContent';
import { View, Checkbox, H1, Input, Label, ListItem, Text, XStack, YStack, Button, RadioGroup, ScrollView } from 'tamagui';
import { Check as CheckIcon, Trash, Plus } from '@tamagui/lucide-icons'
import { useAuth } from '~/providers/AuthProvider';
import React, { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
import { Database } from '~/utils/supabase-types';
import DateTimePicker from 'react-native-ui-datepicker'
import {format} from 'date-fns'

type Todo = Database['public']['Tables']['todos']['Row']

export default function MainTabScreen() {

  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<Profile>()

  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState<Todo>()
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select<Profile>('*')
        .eq('id', user!.id)
        .single()
  
        if(error) console.error(error.message)
          else{
        setUserProfile(profile)}
    }
    fetchProfile()

    const fetchTodos = async () => {
      const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .order('is_complete', { ascending: false })
        .returns<Todo[]>()
  
        todos?.map((todo) => console.log(todo.do_date))
      if (error) {
        console.log('error', error) 
      }
      else if (todos) {
        // console.log(todos)
        setTodos(todos)
      }
      
    }
    fetchTodos()

  }, [])


  const addTodo = async (task : Todo) => {
    const text = task.task?.trim()

    if(text?.length) {
      const { data: todo, error } = await supabase
        .from('todos')
        .insert([
          { 
            task : text, 
            profile_user_id : user!.id,
            difficulty_level : task.difficulty_level,
            do_date : task.do_date

          },//(the ! indicates that TypeScript should ignore potential null or undefined values for user)
        ])
        .select<Todo>('*') // Ensures that the result should be a single object rather than an array of objects.
        .single()

      console.log(todo)
      if (error) {
        console.log(error)
      }
      else {
        
        const pointsUpdated = todo.point_value * todo.difficulty_level
        const { data, error } = await supabase
        .from('todos')
        .update({ point_value : pointsUpdated})
        .eq('id', todo.id)
        .select<Todo>('*')
        .single()
        
        if (error) {
          console.log(error)
        } else {
          todo.point_value = pointsUpdated
          setTodos([todo!, ...todos]); 
          setNewTodo<Todo>(null);
        }
      }
    }
  }

  const toggleTodoStatus = async (id: number, is_complete: boolean) => {
    // console.log(id, is_complete)

    const { data, error } = await supabase  
      .from('todos')
      .update({ is_complete: !is_complete})
      .eq('id', id)
      .select<Todo>('*')
      .single()

      console.log(data)
    if(error) {
      console.log(error)
    }
    else {
      setTodos(todos.map((todo) => (todo.id === id ? data! : todo)))
    }


    
  }

  const deleteTodo = async (id: number) => {
    const { error } = await supabase  
      .from('todos')
      .delete()
      .eq('id', id)

      if (error) {
        console.log(error)
      }
      else {
        setTodos(todos.filter((todo) => todo.id !== Number(id)))
      }
  }

  const handleDate = ( receivedDate : object ) => {
    console.log(receivedDate)
    const dateObject = new Date(receivedDate.date)
    console.log(dateObject)
    setNewTodo({...newTodo, do_date : dateObject.toISOString()})
  }

  const displayDate = ( receivedDate : string ) => {
    const currentDate = new Date()
    const baseDate = new Date(receivedDate)
    // console.log(date)
    // console.log('base '+baseDate)

    const year = baseDate.getFullYear()
    const hours = baseDate.getHours()
    const minutes = baseDate.getMinutes()
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    const differenceInMilliseconds = baseDate.getTime() - currentDate.getTime()
    const differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24))

    if (differenceInDays <= 3 && differenceInDays > 1) {
      return `In ${differenceInDays} days`
    }
    if (differenceInDays === 1) {
      return `Tomorrow at ${formattedHours}:${formattedMinutes}`
    }
    if (differenceInDays === 0) {
      return `Today at ${formattedHours}:${formattedMinutes}`
    }

    if (year === 1970) {
      // console.log('year '+year)
      const formattedDate = new Date(receivedDate).toLocaleString('en-US', {})
      return <Button size={'$1'}>Add date</Button>
    }
    if (hours === 0 && minutes === 0) {
      // console.log('midnight '+hours+':'+minutes)
      const formattedDate = new Date(receivedDate).toLocaleString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'})
      return formattedDate
    }

    const formattedDate = new Date(receivedDate).toLocaleString('en-US', {month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'long'})
    // console.log(formattedDate)
    return formattedDate
  }
  
  return (
    <>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <ScrollView>

        <View 
          alignItems='center'
        >
          <H1>Today's Tasks {userProfile && userProfile.points}</H1>
          {todos && todos.map((todo, index) => {
            return !todo.is_complete ? (
              <YStack
                key={todo.id}
                width={350}
                backgroundColor="#fff"
                borderRadius={5}
                marginVertical='$1.5'
                padding='$3'
              >

              <XStack 
                justifyContent='space-between' 
                alignItems='center'
                
              >
                <Button 
                  icon={Trash}
                  color={'red'}
                  chromeless
                  onPress={() => deleteTodo(todo.id)}
                />
                <Text>{todo.task} ({todo.point_value})</Text>
                <Checkbox onCheckedChange={() => toggleTodoStatus(todo.id, todo.is_complete, todo.difficulty_level, todo.point_value)}>
                  <Checkbox.Indicator >
                    <CheckIcon />
                  </Checkbox.Indicator>
                </Checkbox>
              </XStack>
              <XStack
                justifyContent='flex-start'
                marginLeft='$4'
              >
                <Text marginRight='$4'>{todo.difficulty_level}</Text>
                <Text>{displayDate(todo?.do_date!)}</Text>

              </XStack>
              </YStack>
            ) : null 
          })}
        </View>
        <View>
          {/* <XStack space='$2' alignItems='center' justifyContent='center'> */}
            <Label htmlFor='new-todo'/>
            <Input
              id="new-todo"
              onChangeText={(text) => setNewTodo({...newTodo, task : text})}
              value={newTodo?.task!}
              size={8}
              placeholder='New task...'
            />
            <RadioGroup 
              name="difficulty-level" 
              aria-labelledby='Select one level of difficulty' 
              defaultValue='2'
              onValueChange={(level) => setNewTodo({...newTodo, difficulty_level : parseInt(level)})}
            >
              <YStack>
                <XStack alignItems="center">
                  <RadioGroup.Item value="1" labelledBy="easy">
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                  <Label htmlFor='easy'>Easy</Label>
                </XStack>
                <XStack alignItems="center">
                  <RadioGroup.Item value="2" labelledBy="medium">
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                  <Label htmlFor='medium'>Medium</Label>
                </XStack>
                <XStack alignItems="center">
                  <RadioGroup.Item value="3" labelledBy="hard">
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                  <Label htmlFor='hard'>Hard</Label>
                </XStack>
                <XStack alignItems="center">
                  <RadioGroup.Item value="4" labelledBy="very hard">
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                  <Label htmlFor='very-hard'>Very hard</Label>
                </XStack>
              </YStack>
            </RadioGroup>
            <Button onPress={() => setShowDatePicker(!showDatePicker)}>Pick a date</Button>
            {showDatePicker && (
              <DateTimePicker 
                mode='single'
                date={newTodo?.do_date}
                timePicker={true}
                onChange={(params) => handleDate(params)}
              />
            )}
            <Button 
              icon={Plus} 
              onPress={() => addTodo(newTodo)} 
              size='$6'
            />
          {/* </XStack> */}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
