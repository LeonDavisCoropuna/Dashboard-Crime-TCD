// components/BoxplotVariableSelector.tsx
import { useScatterStore } from "@/store/useScatterStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const boxplotVariables = [
  'likeCount',
  'retweetCount',
  'replyCount',
  'user_followersCount',
  'Confidence-skywalker'
];

export function BoxplotVariableSelector() {
  const { boxplotVariable, setBoxplotVariable } = useScatterStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-48 justify-between">
          Variable: {boxplotVariable}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 max-h-60 overflow-auto">
        {boxplotVariables.map((col) => (
          <DropdownMenuItem
            key={col}
            onClick={() => setBoxplotVariable(col)}
            className="cursor-pointer"
          >
            {col}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}