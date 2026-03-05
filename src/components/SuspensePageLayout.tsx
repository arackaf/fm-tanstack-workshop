import {
  Suspense,
  useEffect,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";
import { Header, type HeaderProps } from "./Header";
import { AnimatePresence } from "framer-motion";
import { AnimatedLoading } from "./loading-state/Loading";

type SuspensePageLayoutProps = HeaderProps & {
  headerChildren?: React.ReactNode;
};

export const SuspensePageLayout: FC<
  PropsWithChildren<SuspensePageLayoutProps>
> = props => {
  const { title, children, headerChildren } = props;
  const [isLoading, setIsLoading] = useState(false);

  return (
    <section>
      <Header title={title} children={headerChildren} />
      <AnimatePresence>
        {isLoading ? <AnimatedLoading /> : null}
      </AnimatePresence>
      <Suspense fallback={<Dummy setExists={setIsLoading} />}>
        {children}
      </Suspense>
    </section>
  );
};

type DummyProps = {
  setExists: (exists: boolean) => void;
};
const Dummy: FC<DummyProps> = props => {
  const { setExists } = props;
  useEffect(() => {
    setExists(true);

    return () => {
      setExists(false);
    };
  }, []);

  return null;
};
