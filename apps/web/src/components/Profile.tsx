import React from "react";
import { trpc } from "../hooks/trpc";
import Form, { type FormHandle } from "./Form";
import Input from "./Input";
import Button from "./Button";
import { useAuth } from "../hooks/auth";

type UserForm = {
  userId: string;
  username: string;
  name: string;
  email: string;
  picture: string;
};

function Profile() {
  const { logout } = useAuth();
  const utils = trpc.useUtils();
  const { isLoading, data, error } = trpc.me.useQuery();

  const updateProfile = trpc.updateProfile.useMutation({
    onSuccess: () => {
      utils.me.invalidate();
    },
  });
  const deleteProfile = trpc.deleteUser.useMutation({
    onSuccess: () => {
      logout();
      utils.me.invalidate();
    },
  });

  const ref = React.useRef<FormHandle>(null);

  const onSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (ref.current) {
        updateProfile.mutate(ref.current.getValue() as UserForm);
      }
    },
    [updateProfile]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data) {
    return;
  }

  return (
    <div className="w-full h-full pr-8 py-2 flex flex-col items-center gap-2">
      <h1 className="text-6xl">Profile</h1>
      <hr className="w-full" />
      <div className="grow w-full flex flex-col justify-center items-center gap-4 ">
        <Form
          className="w-1/3 border-2 flex flex-col p-2 gap-2"
          ref={ref}
          onSubmit={onSubmit}
        >
          <h1 className="text-2xl text-center">Update Profile Info</h1>
          <Input
            inputType="hidden"
            fieldName="userId"
            labelText="User Id"
            value={data.userId}
            hidden
          />
          <Input
            inputType="text"
            fieldName="username"
            labelText="Username"
            value={data.username}
          />
          <Input
            inputType="text"
            fieldName="name"
            labelText="Name"
            value={data.name}
          />
          <Input
            inputType="email"
            fieldName="email"
            labelText="Email"
            value={data.email}
          />
          <Input
            inputType="url"
            fieldName="picture"
            labelText="Picture Url"
            value={data.picture}
          />
          <Button>
            <p className="text-xl">Save</p>
          </Button>
        </Form>
        <hr className="w-1/3" />
        <Button
          onClick={() => {
            deleteProfile.mutate();
          }}
        >
          <p className="text-2xl">Delete Profile</p>
        </Button>
      </div>
    </div>
  );
}

export default Profile;
