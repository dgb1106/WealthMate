import Image from "next/image";
import styles from "./styles";

const MenuBar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <Image
          src="/assets/icon/logo.png"
          alt="Logo"
          width={48}
          height={48}
          className={styles.logoImage}
        />
        <Image
          src="/assets/icon/logo-name.png"
          alt="Logo Name"
          width={160}
          height={48}
          className={styles.logoName}
        />
      </div>
    </div>
  );
};

export default MenuBar; 