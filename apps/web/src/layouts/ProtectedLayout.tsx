import { Outlet } from "react-router-dom"
import { useAuth } from "../hooks/auth"

function ProtectedLayout() {
    const {loggedIn, login} = useAuth()

    if (!loggedIn){
        login()
        return
    }

    return <Outlet/>
}

export default ProtectedLayout