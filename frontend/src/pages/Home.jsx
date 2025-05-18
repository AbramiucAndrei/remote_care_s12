import React from "react";
import { Link } from "react-router-dom";
import styles from "./styling/Home.module.css";
import PageHeader from "../components/PageHeader";
import { FaHandHoldingHeart, FaBriefcase } from "react-icons/fa";

const Home = () => {
  return (
    <div className={styles.container}>
      <PageHeader />
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1>Healthcare at Your Doorstep</h1>
          <p className={styles.tagline}>
            Bringing professional care services to people with mobility
            challenges
          </p>
        </section>

        <section className={styles.services}>
          <div className={styles.servicesList}>
            <span>Massage</span>
            <span>•</span>
            <span>Kinotherapy</span>
            <span>•</span>
            <span>Barber</span>
            <span>•</span>
            <span>And More</span>
          </div>
        </section>

        <section className={styles.cards}>
          <div className={styles.card}>
            <FaHandHoldingHeart className={styles.icon} />
            <h2>Need Care?</h2>
            <p>Book trusted professionals for home services</p>
            <div className={styles.actions}>
              <Link
                to="/register"
                className={`${styles.button} ${styles.primary}`}>
                Sign Up as Client
              </Link>
              <Link to="/login" className={styles.button}>
                Client Login
              </Link>
            </div>
          </div>

          <div className={styles.card}>
            <FaBriefcase className={styles.icon} />
            <h2>Offer Services?</h2>
            <p>Join our network of care professionals</p>
            <div className={styles.actions}>
              <Link
                to="/register"
                className={`${styles.button} ${styles.primary}`}>
                Join as Worker
              </Link>
              <Link to="/login" className={styles.button}>
                Worker Login
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
