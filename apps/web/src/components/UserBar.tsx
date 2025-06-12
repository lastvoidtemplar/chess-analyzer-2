import { useAuth } from "../hooks/auth";
import { trpc } from "../hooks/trpc";

function UserBar() {
  const { loggedIn, login, logout } = useAuth();

  if (!loggedIn) {
    return (
      <div className="flex w-full p-4 justify-center items-center">
        <button className="text-2xl" onClick={login}>
          Sign-in
        </button>
      </div>
    );
  } 
  
  const query = trpc.me.useQuery();

  if (query.isLoading) {
    return <div>Loading</div>;
  }

  if (query.error) {
    return <div>{query.error.message}</div>;
  }

  return (
    <div className="flex w-full p-4 items-center">
      <img  alt="Profile Picture" className="w-16 rounded-full" />
      <div className="pl-2">
        <p className="text-lg">{query.data?.username}</p>
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default UserBar;
