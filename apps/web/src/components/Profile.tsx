import { trpc } from "../hooks/trpc"

function Profile(){
    const query = trpc.secret.useQuery()
    return <div>
        {query.data} - {query.error?.message}
    </div>
}

export default Profile