import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import { Database } from "~/utils/supabase-types";
import { useAuth } from "./AuthProvider";

type TasksContext = {
    todos: Todo[] | null
    setTodos: React.Dispatch<React.SetStateAction<Todo[] | null>>
}

type Todo = Database['public']['Tables']['todos']['Row']

const TasksContext = createContext<TasksContext>({
    todos: null,
    setTodos: () => {}
})

export default function TasksProvider({ children } : PropsWithChildren) {
    const { user } = useAuth()
    const [todos, setTodos] = useState<Todo[] | null>(null)

    useEffect(() => {
        const fetchTodos = async () => {

            if(!user?.id) {
                console.log("Error : user id undefined")
                return
            }

            const { data: todos, error } = await supabase
                .from('todos')
                .select('*')
                .eq('profile_user_id', user?.id)
                .order('is_complete', { ascending: false })
                .returns<Todo[]>()
        
        if(error) {
            console.error(error.message)
        }
        else {
            setTodos(todos)
        }
        }
        fetchTodos()
    },[user?.id])
    
    return (
        <TasksContext.Provider value={{ todos, setTodos }}>
            {children}
        </TasksContext.Provider>
    )
}

export const useTasks = () => useContext(TasksContext)