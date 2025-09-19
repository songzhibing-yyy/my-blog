import { NextPage } from "next";
import { useEffect,useState } from "react";
import styles from './index.module.scss';
interface CountDownProps {
    time: number;
    onEnd: () => void;
}
const CountDown: NextPage<CountDownProps> = ({ time, onEnd }) => {
  const [count, setCount] = useState(time||60);
  useEffect(() => {
    const timer = setInterval(() => {
      if (count > 0) {
        setCount(count - 1);
      } else {
        clearInterval(timer);
        onEnd();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [count, onEnd]);

  return (
    <div>
      <div className={styles.countDown}>{count}</div>
    </div>
  );
};
export default CountDown;