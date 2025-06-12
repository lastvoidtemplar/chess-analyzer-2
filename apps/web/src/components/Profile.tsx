import { trpc } from "../hooks/trpc"

function Profile(){
    const query = trpc.me.useQuery()
    
    if (query.isLoading){
        return <div>Loading</div>
    }

    if (query.error){
        return <div>{query.error.message}</div>
    }

    return <div>
        {query.data?.userId}
    </div>
}

export default Profile