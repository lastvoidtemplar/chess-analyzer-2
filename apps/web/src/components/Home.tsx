import { trpc } from "../hooks/trpc"

function Home(){
    const query = trpc.getGames.useQuery()
    return <div>
        {query.data?.map((el)=>{
            return <div>{el.id}-{el.fen}-{el.analysis}</div>
        })}
    </div>
}

export default Home