import { Button } from "@heroui/button";
import { User } from "@heroui/user";
import { Avatar, AvatarGroup } from "@heroui/avatar";

import { Bookmark, MessagesSquare, ThumbsDown, ThumbsUp } from "lucide-react";

export const PostCard = () => {
  return (
    <div className="flex flex-col items-start gap-4 w-full bg-background p-8 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold">Lorem Ipsum Dolor Sit Amet</h2>
      <User
        avatarProps={{
          src: "https://api.dicebear.com/9.x/glass/svg?seed=John Doe",
          radius: "md",
        }}
        name="John Doe"
        description="6 Hours ago"
      />
      <p>Hi There!</p>
      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellendus
        consectetur ullam voluptatum. Unde, aliquam? Ullam nam, deserunt error
        dignissimos sequi suscipit labore, qui culpa corporis voluptas magni
        perferendis fuga blanditiis.
      </p>
      <div className="flex justify-between w-full mt-4">
        <div className="flex flex-wrap gap-4 w-full">
          <Button variant="light">
            <ThumbsUp size={16} />
            1.3K
          </Button>
          <Button variant="light">
            <ThumbsDown size={16} />
            512
          </Button>
          <Button variant="light">
            <MessagesSquare size={16} />
            120
          </Button>
          <Button variant="light">
            <Bookmark size={16} />
            100
          </Button>
        </div>
        <AvatarGroup max={3} total={117} radius="lg">
          <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
          <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
          <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
        </AvatarGroup>
      </div>
    </div>
  );
};
