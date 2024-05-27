import { Stack } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { ScreenContent } from '~/components/ScreenContent';
import { View, Checkbox, H1, Input, Label, ListItem, Text, XStack, YStack, Button } from 'tamagui';
import { Check as CheckIcon, Trash, Plus } from '@tamagui/lucide-icons'
import { useAuth } from '~/providers/AuthProvider';
import React, { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
import { Database } from '~/utils/supabase-types';

type Todo = Database['public']['Tables']['todos']['Row']

export default function MainTabScreen() {

  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState<string>('')

  // console.log(user?.id)

  

  useEffect(() => {
    const fetchTodos = async () => {
      const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .order('is_complete', { ascending: false })
        .returns<Todo[]>()
  
        console.log(todos)
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


  const addTodo = async (text : string) => {
    const task = text.trim()

    if(task.length) {
      const { data: todo, error } = await supabase
        .from<Todo>('todos')
        .insert([
          { task, profile_user_id: user!.id },//(the ! indicates that TypeScript should ignore potential null or undefined values for user)
        ])
        .select<Todo>('*') // Ensures that the result should be a single object rather than an array of objects.
        .single()

        console.log(todo)
        if (error) {
          console.log(error)
        }
        else {
            console.log(todo);
            setTodos([todo!, ...todos]); 
            setNewTodo('');
        }
    }
  }

  const toggleTodoStatus = async (id: number, is_complete: boolean) => {
    console.log(id, is_complete)
    const { data, error } = await supabase  
      .from('todos')
      .update({ is_complete: !is_complete})
      .eq('id', id)
      .select<Todo>('*')
      .single()

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
  
  return (
    <>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <View 
        alignItems='center'
      >
        <H1>Today's Tasks</H1>
        <FlatList 
          scrollEnabled={true}
          data={todos}
          keyExtractor={(item) => `${item.id}`}
          renderItem={({ item: todo }) => (
            
            
              <XStack 
                width={300} 
                marginVertical='$1.5'
                padding='$3'
                justifyContent='space-between' 
                alignItems='center'
                backgroundColor="#fff"
                borderRadius={5}
              >
                <Button 
                  icon={Trash}
                  color={'red'}
                  chromeless
                  onPress={() => deleteTodo(todo.id)}
                />
                <Text>{todo.task}</Text>
                <Checkbox onCheckedChange={() => toggleTodoStatus(todo.id, todo.is_complete)}>
                  <Checkbox.Indicator >
                    <CheckIcon />
                  </Checkbox.Indicator>
                </Checkbox>
              </XStack>
          )}
        />
      </View>
      <View>
        <XStack space='$2' alignItems='center' justifyContent='center'>
          <Label htmlFor='new-todo'/>
          <Input
            id="new-todo"
            onChangeText={(text) => setNewTodo(text)}
            value={newTodo}
            size={8}
            placeholder='New task...'
          />
          <Button 
            icon={Plus} 
            onPress={() => addTodo(newTodo)} 
            size='$6'
          />
        </XStack>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
