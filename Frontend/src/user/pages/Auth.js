import React, { useState, useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './Auth.css';

import { useHttpClient } from '../../shared/hooks/http-hook';

//STEP 1 - import the ImageUpload component
import ImageUpload from '../../shared/components/FormElements/ImageUpload';


const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);

  
  const { isLoading, sendRequest } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: '',
        isValid: false
      },
      password: {
        value: '',
        isValid: false
      }
    },
    false
  );

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          //STEP 1: add an image key for mode swith
          image: undefined
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: '',
            isValid: false
          },

          //STEP 2
          image: {
            value: null,
            isValid: false
          }
        },
        false
      );
    }
    setIsLoginMode(prevMode => !prevMode);
  };

  
  
  const authSubmitHandler = async event => {
    event.preventDefault();

    //STEP 3: verify our inputs with image upload
    console.log(formState.inputs);
 
    if(isLoginMode){

      try {
        //we do not care about the response data for this component
        await sendRequest (
          'http://localhost:3001/api/users/login', 
          'POST',
          JSON.stringify(   
            {
              //'name': formState.inputs.name.value,  
              'email': formState.inputs.email.value,
              'password': formState.inputs.password.value,
          }),
          {
            'Content-Type' : 'application/json'
          }
        );

        auth.login();
        }
        catch(err) {
          console.log(err);
        }
    }
    else 
    {
      try
      {
        //STEP 4: we can create new Form Data format
        const formData = new FormData();

        //NOTE: on formdata you can add TEXT and BINARY (file) data

        //two arguments
        //1) identifier
        //2) value for identifer
        formData.append('email', formState.inputs.email.value);
        formData.append('name', formState.inputs.name.value);
        formData.append('password', formState.inputs.password.value);

        //NOTE: shoudl be KEY of "image" as this BACKEND is looking for named "image"

        //STEP 4: lets fine tune our request
        //instead of JSON stringify data we replace with our FORM DATA
        //NOTE: the FETCH API automatically adds the right headers to FORM DATA
        //do not need to include the headers manually
        formData.append('image', formState.inputs.image.value);
        await sendRequest(
        'http://localhost:3001/api/users/signup',
        'POST',
        formData
        // JSON.stringify(
        //   {
        //     'name': formState.inputs.name.value,
        //     'email': formState.inputs.email.value,
        //     'password': formState.inputs.password.value,
        
        //   }),
        //   {
        //     'Content-Type' : 'application/json'
        //   },
        );

        auth.login();
      } catch (err) {
        console.log(err);
      }
    }

  };

  return (
    <Card className="authentication">
      <h2>Please Login</h2>
      
      <form onSubmit={authSubmitHandler}>
        {!isLoginMode && (
          <Input
            element="input"
            id="name"
            type="text"
            label="Your Name"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a name."
            onInput={inputHandler}
          />
        )}
        {!isLoginMode && <ImageUpload center id="image" onInput={inputHandler} />}
        <Input
          element="input"
          id="email"
          type="email"
          label="E-Mail"
          validators={[VALIDATOR_EMAIL()]}
          errorText="Please enter a valid email address."
          onInput={inputHandler}
        />
        <Input
          element="input"
          id="password"
          type="password"
          label="Password"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid password, at least 5 characters."
          onInput={inputHandler}
        />
        <Button type="submit" disabled={!formState.isValid}>
          {isLoginMode ? 'LOGIN' : 'REGISTER'}
        </Button>
      </form>
      <Button inverse onClick={switchModeHandler}>
        {isLoginMode ? 'REGISTER' : 'LOGIN'}
      </Button>
    </Card>
  );
};

export default Auth;
