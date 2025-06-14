import { trpc } from "../hooks/trpc"

function Home(){
    const query = trpc.hello.useQuery()
    return <div className="w-full h-full flex justify-center items-center">
        <h1 className="text-6xl">{query.data}</h1>
    </div>
}

export default Home