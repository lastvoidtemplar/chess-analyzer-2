import { trpc } from "../hooks/trpc"

function Home(){
    const query = trpc.hello.useQuery()
    return <div className="text-6xl">
        {query.data}
    </div>
}

export default Home