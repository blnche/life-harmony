import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import { Database } from "~/utils/supabase-types";
import { useAuth } from "./AuthProvider";

type UserProfileContext = {
    userProfile: Profile | null
}

type Profile = Database['public']['Tables']['profiles']['Row']

const UserProfileContext = createContext<UserProfileContext>({
    userProfile: null,
})

export default function UserProfileProvider({ children } : PropsWithChildren) {
    const { user } = useAuth()
    const [userProfile, setUserProfile] = useState<Profile | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {

            if(!user?.id) {
                console.log("Error : user id undefined")
                return
            }
            // console.log(session)
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single()
        
        if(error) {
            console.error(error.message)
        }
        else {
            setUserProfile(profile)
        }
        }
        fetchProfile()
    },[user?.id])
    
    return (
        <UserProfileContext.Provider value={{ userProfile }}>
            {children}
        </UserProfileContext.Provider>
    )
}

export const useUserProfile = () => useContext(UserProfileContext)