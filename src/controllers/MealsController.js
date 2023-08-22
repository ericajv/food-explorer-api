const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const DiskStorage = require("../providers/DiskStorage")

class MealsController {
  async index(request, response) {
    const { search } = request.query

    let mealsWithCategories

    if (search) {
      mealsWithCategories = await knex("categories")
        .select(["meals.*", "categories.name as category_name"])
        .innerJoin("meals", "meals.category_id", "categories.id")
        .whereLike("meals.name", `%${search}%`)
        .orWhereLike("categories.name", `%${search}%`)
    } else {
      mealsWithCategories = await knex("categories")
        .select(["meals.*", "categories.name as category_name"])
        .innerJoin("meals", "meals.category_id", "categories.id")
    }

    let categories = mealsWithCategories.map(meal => meal.category_name)
    categories = [...new Set(categories)]

    const meals = {}
    for (const category of categories) {
      const filteredMeals = mealsWithCategories.filter(meal => meal.category_name == category)
      meals[category] = await Promise.all(filteredMeals.map(async meal => {
        const ingredients = await knex("ingredients").select(["name"]).where({ meal_id: meal.id })
        return { ...meal, ingredients: ingredients.map(ingredient => ingredient.name) }
      }))
    }

    return response.json(meals)
  }

  async show(request, response) {
    const { id } = request.params

    const meal = await knex("meals")
      .select(["meals.*", "categories.name as category_name"])
      .innerJoin("categories", "categories.id", "meals.category_id")
      .where("meals.id", id)
      .first()

    if (!meal) {
      throw new AppError(`Não foi possível encontrar refeição id: ${id}`)
    }

    const ingredients = await knex("ingredients").select(["name"]).where({ meal_id: meal.id })

    return response.json({ ...meal, ingredients: ingredients.map(ingredient => ingredient.name) })
  }

  async store(request, response) {
    const { name, value, description, category_name, ingredients = [] } = request.body

    const category_id = await MealsController.getCategoryIdByName(category_name)

    const [meal_id] = await knex("meals").insert({ name, value, description, category_id })

    await knex("ingredients").where({ meal_id }).delete()

    if (ingredients.length !== 0) {
      const ingredientsInsert = ingredients.map(ingredient => { return { meal_id, name: ingredient } })

      await knex("ingredients").insert(ingredientsInsert)
    }

    return response.status(201).json({ id: meal_id })
  }

  async update(request, response) {
    const { name, value, description, category_name, ingredients = [] } = request.body
    const { id } = request.params

    let meal = await knex("meals").where({ id }).first()

    if (!meal) {
      throw new AppError(`Não foi possível encontrar refeição id: ${id}`)
    }

    const category_id = await MealsController.getCategoryIdByName(category_name)

    await knex("meals").update({ name, value, description, category_id }).where({ id })

    await knex("ingredients").where({ meal_id: id }).delete()

    if (ingredients.length !== 0) {
      const ingredientsInsert = ingredients.map(ingredient => { return { meal_id: id, name: ingredient } })

      await knex("ingredients").insert(ingredientsInsert)
    }

    return response.json({ id })
  }

  static async getCategoryIdByName(name) {
    let id

    const category = await knex("categories").where({ name }).first()
    if (category && category.id) {
      id = category.id
    } else {
      [id] = await knex("categories").insert({ name })
    }

    return id
  }

  async updateImage(request, response) {
    const mealFilename = request.file.filename
    const { id } = request.params

    let meal = await knex("meals").where({ id }).first()

    if (!meal) {
      throw new AppError(`Não foi possível encontrar refeição id: ${id}`)
    }

    const diskStorage = new DiskStorage()

    if (meal.image) {
      await diskStorage.deleteFile(meal.image)
    }

    const filename = await diskStorage.saveFile(mealFilename)
    meal.image = filename

    await knex("meals").update(meal).where({ id })

    return response.json(meal)
  }

  async destroy(request, response) {
    const { id } = request.params

    const meal = await knex("meals").where({ id }).first()

    if (!meal) {
      throw new AppError(`Não foi possível encontrar refeição id: ${id}`)
    }

    await knex("meals").where({ id }).delete()

    return response.json({})
  }
}

module.exports = MealsController