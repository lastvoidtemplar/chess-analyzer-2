import { useAuth } from "../hooks/auth";
import { trpc } from "../hooks/trpc";
import Button from "./Button";

function UserBar() {
  const { loggedIn, login, logout } = useAuth();
  const query = trpc.me.useQuery();

  if (!loggedIn) {
    return (
      <div className="flex w-full p-4 justify-center items-center">
        <Button onClick={login}>
          <p className="text-2xl">Sign-in</p>
        </Button>
      </div>
    );
  }

  if (query.isLoading) {
    return <div>Loading</div>;
  }

  if (query.error) {
    return <div>{query.error.message}</div>;
  }

  return (
    <div className="flex w-full p-4 items-center gap-2">
      <img
        src={"dsff"}
        alt="Profile Picture"
        className="w-16 rounded-full"
      />
      <div className="flex flex-col items-center gap-0.5">
        <div>
          <p className="text-lg">{query.data?.username}</p>
        </div>
        <Button onClick={logout}>
          <p className="text-lg">Logout</p>
        </Button>
      </div>
    </div>
  );
}

export default UserBar;
