import { useSelector } from "react-redux";
import { Task } from "../Task/Task";
import { getTasks, getStatusFilter } from "../../redux/selectors";
import css from "./TaskList.module.css";
import { statusFilters } from "../../redux/constants";

const getVisibleTasks = (tasks, statusFilter) => {
  switch (statusFilter) {
    case statusFilters.active:
      return tasks.filter((task) => !task.completed);
    case statusFilters.completed:
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
};

export const TaskList = () => {
  const tasks = useSelector(getTasks) || []; // Гарантуємо, що це масив
  const statusFilter = useSelector(getStatusFilter);
  const visibleTasks = getVisibleTasks(tasks, statusFilter);

  // Додатковий захист: перевірка чи це дійсно масив
  if (!Array.isArray(tasks)) {
    return null;
  }

  return (
    <ul className={css.list}>
      {visibleTasks.map((task) => (
        <li className={css.listItem} key={task.id}>
          <Task task={task} />
        </li>
      ))}
    </ul>
  );
};
