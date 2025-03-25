module.exports = {
  //? Validation Rules
  VALIDATION_RULES: {
    USER: {
      name: "required|string|min:2|max:30",
      email: "required|email",
      password:
        "required|min:8|max:16|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/",
      gender: "required|string|in:Male,Female,Other",
      city: "required|string|min:2|max:50",
      country: "required|string|min:2|max:50",
      companyName: "string|min:2|max:64",
    },
    ITEM: {
      name: "required|string|min:2|max:100",
      category: "required|string|min:2|max:50",
      subcategory: "string|min:2|max:50",
      description: "string|max:500",
    },
  },
};
