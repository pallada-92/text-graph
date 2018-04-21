export const forRange = (num, fun) => {
  for (let i = 0; i < num; i++) {
    fun(num);
  }
};

