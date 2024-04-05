import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ){}


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto ); 
      return pokemon;
      
    } catch (error) {
      this.error( error );
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {
    let pokemon: Pokemon;

    if ( !isNaN(+id) ){
      pokemon = await this.pokemonModel.findOne({ no: id });
    }

    if ( !pokemon && isValidObjectId( id )){
      pokemon = await this.pokemonModel.findById( id );
    }

    if( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: id.toLocaleLowerCase().trim() })
    }
    
    if( !pokemon ) throw new NotFoundException(`Pokemon with id, name or no ${ id } not found`);


    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne( id );
    if( updatePokemonDto.name ){
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }

    try {
      await pokemon.updateOne( updatePokemonDto );
      return { ...pokemon.toJSON(), ...updatePokemonDto}


    } catch (error) {
      this.error( error );
    }
    
    
    
    
    return `This action updates a #${id} pokemon`;
  }

  async remove(id: string) {
    // const pokemon = await this.findOne( id );
    // await pokemon.deleteOne()

    // const result = await this.pokemonModel.findByIdAndDelete( id );
    const { deletedCount, acknowledged } = await this.pokemonModel.deleteOne({ _id: id });
    if ( deletedCount === 0 ){
      throw new BadRequestException(`Pokemon with id ${ id } not found`);
    }

    return deletedCount;
  }

  error( error: any){
    if ( error.code === 11000 ){
      throw new BadRequestException(`Pokemon exist in db ${ JSON.stringify( error.keyValue)}`);
    }
    console.error(error);
      throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`)
  };
  
}
