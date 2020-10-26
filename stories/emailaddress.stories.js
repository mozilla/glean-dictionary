import EmailAddress from "../src/components/EmailAddress.svelte";

export default {
  title: "Email",
};

export const SingleEmail = () => ({
  Component: EmailAddress,
  props: {
    emails: ["glean@mozilla.com"],
  },
});

export const MultipleEmails = () => ({
  Component: EmailAddress,
  props: {
    emails: ["example@example.com", "email@email.com", "post@pigeon.com"],
  },
});
