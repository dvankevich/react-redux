import { useSelector } from 'react-redux';
import { Button } from '../Button/Button';
import css from './StatusFilter.module.css';

export const StatusFilter = () => {
  const filter = useSelector((state) => state.filters.status);

  return (
    <div className={css.wrapper}>
      <Button selected={filter === 'all'}>All</Button>
      <Button selected={filter === 'active'}>Active</Button>
      <Button selected={filter === 'completed'}>Completed</Button>
    </div>
  );
};
