import html from '@elysiajs/html';
import { Elysia, t } from 'elysia';
import * as elements from 'typed-html';

const app = new Elysia()
  .use(html())
  .get('/', ({ html }) =>
    html(
      <BaseHtml>
        <body
          class='flex w-full h-screen justify-center items-center'
          hx-get='/todos'
          hx-trigger='load'
          hx-swap='innerHTML'
        />
      </BaseHtml>
    )
  )
  .get('/todos', () => <ToDoList toDos={db} />)
  .post(
    '/todos/toggle/:id',
    ({ params }) => {
      const toDoFound = db.find((toDoItem) => toDoItem.id === params.id);

      if (toDoFound) {
        toDoFound.completed = !toDoFound.completed;
        return <ToDoItem {...toDoFound} />;
      }
    },
    {
      params: t.Object({ id: t.Numeric() }),
    }
  )
  .delete(
    '/todos/:id',
    ({ params }) => {
      const toDoFound = db.find((toDoItem) => toDoItem.id === params.id);

      if (toDoFound) {
        db.splice(db.indexOf(toDoFound), 1);
      }
    },
    {
      params: t.Object({ id: t.Numeric() }),
    }
  )
  .listen(3000);

console.log(`Eylsia @ http://${app.server?.hostname}: ${app.server?.port}`);

const BaseHtml = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BETH Budget Planner</title>
  <script src="https://unpkg.com/htmx.org@1.9.5"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>

${children}
`;

type ToDo = {
  id: number;
  content: string;
  completed: boolean;
};

const db: ToDo[] = [
  { id: 0, content: 'first todo', completed: true },
  { id: 1, content: 'second todo', completed: false },
];

const ToDoItem = ({ content, completed, id }: ToDo) => (
  <div class='flex flex-row space-x-3'>
    <p>{content}</p>
    <input
      type='checkbox'
      checked={completed}
      hx-post={`/todos/toggle/${id}`}
      hx-target='closest div'
      hx-swap='outerHTML'
    />
    <button
      class='text-red-500'
      hx-delete={`/todos/${id}`}
      hx-swap='outerHTML'
      hx-target='closest div'>
      X
    </button>
  </div>
);

const ToDoList = ({ toDos }: { toDos: ToDo[] }) => (
  <div>
    {toDos.map((toDo) => (
      <ToDoItem {...toDo} />
    ))}
  </div>
);
