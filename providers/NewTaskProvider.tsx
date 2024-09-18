import { createContext, useState, useContext } from "react"
import { useTranslation } from "react-i18next"
import { useUserProfile } from "~/providers/UserProfileProvider"
import { Database } from "~/utils/supabase-types"

const NewTaskContext = createContext()

type Todo = Database['public']['Tables']['todos']['Row']

export const NewTaskProvider = ({ children }) => {
    const {t} = useTranslation()
    const { userProfile } = useUserProfile()

    const [newTodo, setNewTodo] = useState<Partial<Todo>>({
        do_date: null,
        difficulty_level: 2,
        priority: t('medium'),
        time_block_id: '08b61182-86a9-4141-8ae3-69c0c3bff440',
        user_id: userProfile?.id,
        status: t('backlog')
    })

    const handleDate = (selectedDate) => {
        setNewTodo(prevTodo => ({
            ...prevTodo,
            do_date: selectedDate.toISOString()
        }))
    }

    return (
        <NewTaskContext.Provider value={{newTodo, handleDate}}>
            {children}
        </NewTaskContext.Provider>
    )
}

export const useNewTaskContext = () => useContext(NewTaskContext)