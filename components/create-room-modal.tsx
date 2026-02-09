import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRoomAction } from "@/lib/actions/createRoomAction";
import { ROOM_TYPE } from "@/lib/api/rooms";
import { useToggle } from "@/lib/hooks/useToggle";
import { FC } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

interface ICreateRoomForm {
  name: string;
}

export const CreateRoomModal: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isLoading, toggleLoading] = useToggle();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ICreateRoomForm>();

  const onSubmit: SubmitHandler<ICreateRoomForm> = async (data) => {
    toggleLoading();
    try {
      await createRoomAction({
        name: data.name,
        type: ROOM_TYPE.Audio,
      });
      onClose();
    } catch (_) {
      toast.error("Ошибка создания комнаты");
    } finally {
      toggleLoading();
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Создать комнату</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Название</Label>
            <Input
              disabled={isLoading}
              id="name"
              placeholder="Введите название комнаты"
              {...register("name", {
                required: "Название обязательно",
                maxLength: {
                  value: 150,
                  message: "Название не должно превышать 150 символов",
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isLoading} type="submit">
            Создать
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
